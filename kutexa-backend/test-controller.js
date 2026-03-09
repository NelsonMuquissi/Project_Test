const { sequelize } = require('./src/config/database');
const { getDashboardKPIs } = require('./src/controllers/reportController');

async function test() {
    await sequelize.authenticate();
    require('./src/models/associations').applyAssociations();

    const req = {
        user: { id: 'ef566b83-8326-4cc9-85d1-a561790e84b2', role: 'gestor' },
        params: { companyId: '224b5853-d19d-4bb2-a9bf-1df946840046' },
        query: {}
    };

    const res = {
        status: function (code) { this.code = code; return this; },
        json: function (data) { console.log('RESPONSE:', { code: this.code, data: JSON.stringify(data, null, 2) }); return this; }
    };

    const next = function (err) { console.error('NEXT CALLED WITH ERROR:', err); };

    await getDashboardKPIs(req, res, next);
    process.exit(0);
}

test();
