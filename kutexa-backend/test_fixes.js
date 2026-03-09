/**
 * Script de Teste Manual para Validação das Correções
 * 
 * Este script verifica se as correções críticas foram aplicadas corretamente nos modelos.
 */

const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const RefreshToken = require('./src/models/RefreshToken');
const UploadedFile = require('./src/models/UploadedFile');
const ReconciliationJob = require('./src/models/ReconciliationJob');
const Transaction = require('./src/models/Transaction');

async function runTests() {
    console.log('--- INICIANDO TESTES DE VALIDAÇÃO ---');

    try {
        // 1. Validar RefreshToken
        const rtAttrs = RefreshToken.rawAttributes;
        if (rtAttrs.id && rtAttrs.id.allowNull === false) {
            console.log('✅ RefreshToken: Campo ID está configurado corretamente (allowNull: false).');
        } else {
            console.error('❌ RefreshToken: Campo ID inválido ou permite null.');
        }

        // 2. Validar UploadedFile Enum
        const ufAttrs = UploadedFile.rawAttributes;
        const sourceTypeEnum = ufAttrs.sourceType.values;
        if (sourceTypeEnum.includes('erp_ledger')) {
            console.log('✅ UploadedFile: Enum sourceType inclui "erp_ledger".');
        } else {
            console.error('❌ UploadedFile: Enum sourceType NÃO inclui "erp_ledger".');
        }

        // 3. Validar Outros Modelos (IDs)
        const modelsToTest = [
            { name: 'ReconciliationJob', model: ReconciliationJob },
            { name: 'Transaction', model: Transaction },
            { name: 'User', model: User }
        ];

        for (const item of modelsToTest) {
            const attrs = item.model.rawAttributes;
            if (attrs.id && attrs.id.primaryKey && attrs.id.allowNull === false) {
                console.log(`✅ ${item.name}: ID configurado corretamente.`);
            } else {
                console.error(`❌ ${item.name}: Falha na configuração do ID.`);
            }
        }

        console.log('\n--- TESTES CONCLUÍDOS ---');
    } catch (error) {
        console.error('Erro durante os testes:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
