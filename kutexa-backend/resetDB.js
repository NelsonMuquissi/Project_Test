// scripts/reset-and-migrate.js
'use strict';

require('dotenv').config();
const { spawnSync } = require('child_process');
const { sequelize } = require('./src/config/database');

async function run() {
  try {
    console.log('Conectando ao DB...');
    await sequelize.authenticate();

    console.log('Dropping public schema (CASCADE) e recriando — isto APAGA TODOS OS DADOS no schema public.');
    // executa com a conexão do sequelize (sem precisar de psql independente)
    await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('Rodando migrations via sequelize-cli...');
    // chama sequelize-cli db:migrate
    const res = spawnSync('npx', ['sequelize-cli', 'db:migrate'], { stdio: 'inherit', shell: true, env: process.env });

    if (res.status !== 0) {
      throw new Error('Erro ao rodar migrations (ver logs acima).');
    }

    console.log('Migrations aplicadas com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Erro no reset-and-migrate:', err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch(e) {}
  }
}

run();
