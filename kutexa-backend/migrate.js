const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const License = require('./src/models/License');
const Company = require('./src/models/Company');
const CompanyUser = require('./src/models/CompanyUser');
const BankAccount = require('./src/models/BankAccount');
const ReconciliationJob = require('./src/models/ReconciliationJob');
const UploadedFile = require('./src/models/UploadedFile');
const Transaction = require('./src/models/Transaction');
const ReconciliationMatch = require('./src/models/ReconciliationMatch');
const RefreshToken = require('./src/models/RefreshToken');
require('./src/models/associations');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection established for migration.');

        // Targeted sync for Company only to add missing columns safely
        await Company.sync({ alter: true });
        console.log('✅ Tabela COMPANIES sincronizada com sucesso.');

        // Targeted sync for BankAccount 
        await BankAccount.sync({ alter: true });
        console.log('✅ Tabela BANK_ACCOUNTS sincronizada com sucesso.');

    } catch (error) {
        console.error('❌ Falha na migração:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
