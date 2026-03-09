const { sequelize } = require('./src/config/database');
const { Op } = require('sequelize');
const CompanyUser = require('./src/models/CompanyUser');
const ReconciliationJob = require('./src/models/ReconciliationJob');
const Transaction = require('./src/models/Transaction');
const ReconciliationMatch = require('./src/models/ReconciliationMatch');
const BankAccount = require('./src/models/BankAccount');

async function testKPIs() {
    try {
        await sequelize.authenticate();
        require('./src/models/associations').applyAssociations();

        const companyId = '224b5853-d19d-4bb2-a9bf-1df946840046'; // kutexa
        const userId = 'ef566b83-8326-4cc9-85d1-a561790e84b2'; // nelson

        const membership = await CompanyUser.findOne({ where: { userId, companyId } });
        console.log('Membership:', membership ? 'Found' : 'Not Found');

        const totalJobs = await ReconciliationJob.count({ where: { companyId } });
        const completedJobs = await ReconciliationJob.count({ where: { companyId, status: 'completed' } });
        console.log('Jobs:', { totalJobs, completedJobs });

        const relevantJobs = await ReconciliationJob.findAll({ where: { companyId }, attributes: ['id'] });
        const jobIds = relevantJobs.map(job => job.id);
        console.log('Job IDs:', jobIds);

        if (jobIds.length > 0) {
            const totalTransactions = await Transaction.count({ where: { jobId: { [Op.in]: jobIds } } });
            const reconciledTransactions = await Transaction.count({
                where: {
                    jobId: { [Op.in]: jobIds },
                    status: { [Op.in]: ['reconciled', 'matched'] }
                }
            });
            const totalMatches = await ReconciliationMatch.count({ where: { jobId: { [Op.in]: jobIds } } });
            const confirmedMatches = await ReconciliationMatch.count({ where: { jobId: { [Op.in]: jobIds }, status: 'confirmed' } });

            console.log('Stats:', { totalTransactions, reconciledTransactions, totalMatches, confirmedMatches });
        }

        const bankAccounts = await BankAccount.findAll({
            where: { companyId },
            include: [{
                model: Transaction,
                where: { jobId: { [Op.in]: jobIds } },
                required: false
            }]
        });
        console.log('Banks:', bankAccounts.map(b => b.bankName));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testKPIs();
