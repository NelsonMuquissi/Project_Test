const { sequelize } = require('./src/config/database');
const CompanyUser = require('./src/models/CompanyUser');
const { applyAssociations } = require('./src/models/associations');

async function syncDb() {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();
        applyAssociations();

        console.log('Syncing CompanyUser...');
        await CompanyUser.sync({ alter: true });

        console.log('Done!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

syncDb();
