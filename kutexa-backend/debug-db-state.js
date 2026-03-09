const { sequelize } = require('./src/config/database');
const Company = require('./src/models/Company');
const BankAccount = require('./src/models/BankAccount');
const User = require('./src/models/User');
const CompanyUser = require('./src/models/CompanyUser');
require('./src/models/associations');

async function debugDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const companies = await Company.findAll({ raw: true });
        console.log('\n--- COMPANIES ---');
        console.table(companies);

        const accounts = await BankAccount.findAll({ raw: true });
        console.log('\n--- BANK ACCOUNTS ---');
        console.table(accounts);

        const companyUsers = await CompanyUser.findAll({ raw: true });
        console.log('\n--- COMPANY USERS ---');
        console.table(companyUsers);

        const users = await User.findAll({ attributes: ['id', 'email', 'name'], raw: true });
        console.log('\n--- USERS ---');
        console.table(users);

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await sequelize.close();
    }
}

debugDB();
