const { sequelize } = require('./src/config/database');
const Company = require('./src/models/Company');
const User = require('./src/models/User');
const CompanyUser = require('./src/models/CompanyUser');
const { getDashboardKPIs } = require('./src/controllers/reportController');

async function testQuery() {
    try {
        await sequelize.authenticate();
        require('./src/models/associations').applyAssociations();

        const companies = await Company.findAll();
        console.log('Companies:', companies.map(c => ({ id: c.id, name: c.name })));

        const users = await User.findAll();
        console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));

        const cu = await CompanyUser.findAll();
        console.log('CompanyUsers:', cu.map(c => ({ userId: c.userId, companyId: c.companyId })));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testQuery();
