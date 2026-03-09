const { sequelize } = require('./src/config/database');
const Company = require('./src/models/Company');
const BankAccount = require('./src/models/BankAccount');
const ReconciliationJob = require('./src/models/ReconciliationJob');
const ReconciliationMatch = require('./src/models/ReconciliationMatch');
const Transaction = require('./src/models/Transaction');

async function seedData() {
    try {
        await sequelize.authenticate();
        require('./src/models/associations').applyAssociations();

        const companyName = 'kutexa';
        const company = await Company.findOne({ where: { name: companyName } });
        if (!company) {
            console.log(`Empresa "${companyName}" não encontrada!`);
            return;
        }

        // Obter contas
        const accounts = await BankAccount.findAll({ where: { companyId: company.id } });
        let account1 = accounts[0];

        if (!account1) {
            account1 = await BankAccount.create({
                companyId: company.id,
                bankName: 'BAI',
                accountNumber: '123456789',
                iban: 'AO0600400000123456789',
                currency: 'AOA'
            });
            console.log('Criada conta bancária simulada para a empresa', companyName);
        }

        console.log(`Gerando dados realistas para a empresa ${company.name}...`);

        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 2));

            const job = await ReconciliationJob.create({
                companyId: company.id,
                status: 'completed',
                matchCount: Math.floor(Math.random() * 50) + 15,
                createdAt: date
            });

            const txCount = job.matchCount + Math.floor(Math.random() * 10);

            for (let j = 0; j < txCount; j++) {
                const isMatched = j < job.matchCount;
                await Transaction.create({
                    jobId: job.id,
                    bankAccountId: account1.id,
                    date: date,
                    description: isMatched ? 'Pagamento Fornecedor XYZ' : 'Despesa não identificada',
                    amount: (Math.random() * 150000).toFixed(2),
                    sourceType: 'bank',
                    status: isMatched ? 'matched' : 'unreconciled'
                });
            }

            for (let m = 0; m < job.matchCount; m++) {
                await ReconciliationMatch.create({
                    jobId: job.id,
                    confidenceScore: 0.95 + (Math.random() * 0.05),
                    status: 'confirmed',
                    createdAt: date
                });
            }
        }

        console.log('Seed de dados finalizado com sucesso para', companyName);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

seedData();
