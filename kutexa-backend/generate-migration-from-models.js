'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { sequelize } = require('./src/config/database');
const Sequelize = require('sequelize');

const modelsPath = path.join(__dirname, 'src', 'models');

function requireAllModels(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      requireAllModels(p);
    } else if (f.endsWith('.js') && f !== 'associations.js') {
      require(p);
    }
  });
}

function mapAttributeToMigration(attr) {
  const pieces = [];
  let defaultAdded = false;

  const DataType = attr.type;
  if (DataType && DataType.key) {
    const key = DataType.key;
    switch (key) {
      case 'UUID':
        pieces.push('type: Sequelize.UUID');
        break;
      case 'STRING':
        if (DataType._length) pieces.push(`type: Sequelize.STRING(${DataType._length})`);
        else pieces.push('type: Sequelize.STRING');
        break;
      case 'TEXT':
        pieces.push('type: Sequelize.TEXT');
        break;
      case 'DATE':
        pieces.push('type: Sequelize.DATE');
        break;
      case 'DATEONLY':
        pieces.push('type: Sequelize.DATEONLY');
        break;
      case 'BOOLEAN':
        pieces.push('type: Sequelize.BOOLEAN');
        break;
      case 'JSON':
      case 'JSONB':
        pieces.push('type: Sequelize.JSONB');
        break;
      case 'DECIMAL':
        if (DataType._precision && DataType._scale) pieces.push(`type: Sequelize.DECIMAL(${DataType._precision}, ${DataType._scale})`);
        else pieces.push('type: Sequelize.DECIMAL');
        break;
      case 'INTEGER':
        pieces.push('type: Sequelize.INTEGER');
        break;
      case 'FLOAT':
        pieces.push('type: Sequelize.FLOAT');
        break;
      case 'ENUM':
        if (DataType.values && Array.isArray(DataType.values)) {
          const vals = DataType.values.map(v => JSON.stringify(v)).join(', ');
          pieces.push(`type: Sequelize.ENUM(${vals})`);
        } else {
          pieces.push('type: Sequelize.ENUM');
        }
        break;
      default:
        pieces.push(`type: Sequelize.${key}`);
    }
  } else {
    pieces.push(`type: Sequelize.STRING`);
  }

  if (attr.allowNull === false) pieces.push('allowNull: false');
  if (attr.primaryKey) pieces.push('primaryKey: true');
  if (attr.unique === true) pieces.push('unique: true');

  // Detecção robusta de defaultValue
  if (attr.defaultValue !== undefined && attr.defaultValue !== null) {
    const dv = attr.defaultValue;
    
    // UUIDV4 check
    if (dv === Sequelize.UUIDV4 || (dv.constructor && dv.constructor.name === 'UUIDV4') || (dv.key === 'UUIDV4') || (typeof dv === 'function' && dv.name === 'uuidv4')) {
        pieces.push('defaultValue: Sequelize.UUIDV4');
        defaultAdded = true;
    } 
    // NOW check
    else if (dv === Sequelize.NOW || (dv.constructor && dv.constructor.name === 'NOW') || (dv.key === 'NOW')) {
        pieces.push('defaultValue: Sequelize.NOW');
        defaultAdded = true;
    }
    // Literal check
    else if (dv instanceof Sequelize.Utils.Literal || (dv.constructor && dv.constructor.name === 'Literal')) {
        pieces.push(`defaultValue: Sequelize.literal(${JSON.stringify(dv.val)})`);
        defaultAdded = true;
    }
    // Primitive types
    else if (typeof dv === 'string') {
        if (dv.toLowerCase().includes('current_timestamp')) {
            pieces.push("defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')");
        } else {
            pieces.push(`defaultValue: ${JSON.stringify(dv)}`);
        }
        defaultAdded = true;
    } else if (typeof dv === 'number' || typeof dv === 'boolean') {
        pieces.push(`defaultValue: ${dv}`);
        defaultAdded = true;
    }
  }

  if (attr.references) {
    let refTable = attr.references.model;
    // Se o model for um objeto (referência direta), extrai o tableName
    if (typeof refTable !== 'string' && refTable.tableName) {
        refTable = refTable.tableName;
    }
    const refKey = attr.references.key || 'id';
    pieces.push(`references: { model: '${refTable}', key: '${refKey}' }`);
    if (attr.onDelete) pieces.push(`onDelete: '${attr.onDelete}'`);
    if (attr.onUpdate) pieces.push(`onUpdate: '${attr.onUpdate}'`);
  }

  return `{ ${pieces.join(', ')} }`;
}

function topologicalSortModels(modelsMap) {
  const visited = new Set();
  const temp = new Set();
  const result = [];

  function visit(n) {
    if (visited.has(n)) return;
    if (temp.has(n)) {
        console.warn(`Circular dependency detected involving model: ${n}. Sorting may be incomplete.`);
        return;
    }
    temp.add(n);
    for (const dep of modelsMap[n].deps) {
      if (modelsMap[dep]) visit(dep);
    }
    temp.delete(n);
    visited.add(n);
    result.push(n);
  }

  for (const n of Object.keys(modelsMap)) visit(n);
  return result;
}

async function main() {
  requireAllModels(modelsPath);

  try {
    const assoc = require('./src/models/associations');
    if (typeof assoc.applyAssociations === 'function') {
      assoc.applyAssociations();
      console.log('Associações entre modelos aplicadas.');
    }
  } catch (e) {
    console.warn('Aviso: Não foi possível aplicar associações:', e.message);
  }

  const models = sequelize.models;
  if (!models || Object.keys(models).length === 0) {
    console.error('Nenhum model carregado. Verifica src/models.');
    process.exit(1);
  }

  const tableToModel = {};
  for (const [name, model] of Object.entries(models)) {
    const tableName = model.tableName || name;
    tableToModel[tableName] = name;
  }

  const map = {};
  for (const [name, model] of Object.entries(models)) {
    const attrs = model.rawAttributes || {};
    const deps = new Set();
    
    // Validação de ID
    if (!attrs.id) {
        console.error(`ERRO CRÍTICO: Modelo ${name} não tem o campo 'id' definido!`);
    } else if (!attrs.id.primaryKey) {
        console.warn(`Aviso: Modelo ${name} tem campo 'id' mas não está marcado como primaryKey.`);
    }

    for (const [attrName, attr] of Object.entries(attrs)) {
      if (attr.references && attr.references.model) {
        let refTable = attr.references.model;
        if (typeof refTable !== 'string' && refTable.tableName) {
            refTable = refTable.tableName;
        }
        const refModelName = tableToModel[refTable];
        if (refModelName) {
          deps.add(refModelName);
        }
      }
    }
    const tableName = model.tableName || name;
    map[name] = { model, name, tableName, attrs, deps };
  }

  const order = topologicalSortModels(map);
  
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const filename = `${timestamp}-auto-generated-from-models.js`;
  const outDir = path.join(__dirname, 'src', 'database', 'migrations');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);

  let upParts = [];
  for (const modelName of order) {
    const m = map[modelName];
    const tableName = m.tableName;
    const attrs = m.attrs;
    const fieldLines = [];
    for (const [attrName, attr] of Object.entries(attrs)) {
      const columnName = attr.field || attrName;
      const mig = mapAttributeToMigration(attr);
      fieldLines.push(`        ${JSON.stringify(columnName)}: ${mig}`);
    }

    const createTable = `
    await queryInterface.createTable(${JSON.stringify(tableName)}, {
${fieldLines.join(',\n')}
    });
`;
    upParts.push(createTable);
  }

  const downParts = order.slice().reverse().map(mn => {
    const tableName = map[mn].tableName;
    return `    await queryInterface.dropTable(${JSON.stringify(tableName)});`;
  }).join('\n');

  const content = `'use strict';
/** Auto-generated migration from models at ${new Date().toISOString()} */
module.exports = {
  async up(queryInterface, Sequelize) {
${upParts.join('\n')}
  },

  async down(queryInterface, Sequelize) {
${downParts}
  }
};
`;

  fs.writeFileSync(outPath, content, { encoding: 'utf8' });
  console.log('Migration gerada com sucesso em:', outPath);
}

main().catch(err => {
  console.error('Erro fatal ao gerar migration:', err);
  process.exit(1);
});
