const User = require('./User');
const License = require('./License');
const Company = require('./Company');
const CompanyUser = require('./CompanyUser');
const BankAccount = require('./BankAccount');
const ReconciliationJob = require('./ReconciliationJob');
const UploadedFile = require('./UploadedFile');
const Transaction = require('./Transaction');
const ReconciliationMatch = require('./ReconciliationMatch');
const RefreshToken = require('./RefreshToken');

function applyAssociations() {
    
    // Relação User <-> License (Um-para-Um)
    User.hasOne(License, { foreignKey: 'userId', onDelete: 'CASCADE' });
    License.belongsTo(User, { foreignKey: 'userId' });

    // Relação User <-> Company (Muitos-para-Muitos através de CompanyUser)
    User.belongsToMany(Company, { through: CompanyUser, foreignKey: 'userId' });
    Company.belongsToMany(User, { through: CompanyUser, foreignKey: 'companyId' });

    // Necessário para fazer queries diretas à tabela de junção (ex: Listar usuários da empresa)
    CompanyUser.belongsTo(User, { foreignKey: 'userId' });
    CompanyUser.belongsTo(Company, { foreignKey: 'companyId' });

    // Relação User <-> RefreshToken (Um-para-Muitos, pois um usuário pode estar logado em vários dispositivos)
    User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });

    // Relação Company <-> BankAccount (Um-para-Muitos)
    Company.hasMany(BankAccount, { foreignKey: 'companyId', onDelete: 'CASCADE' });
    BankAccount.belongsTo(Company, { foreignKey: 'companyId' });

    // Relação Company <-> ReconciliationJob (Uma empresa pode ter vários trabalhos)
    Company.hasMany(ReconciliationJob, { foreignKey: 'companyId', onDelete: 'CASCADE' });
    ReconciliationJob.belongsTo(Company, { foreignKey: 'companyId' });

    // Relação User <-> ReconciliationJob (Um usuário pode iniciar vários trabalhos)
    User.hasMany(ReconciliationJob, { foreignKey: 'userId' });
    ReconciliationJob.belongsTo(User, { as: 'initiatedBy', foreignKey: 'userId' });

    // Relação ReconciliationJob <-> UploadedFile (Um trabalho pode ter vários ficheiros)
    ReconciliationJob.hasMany(UploadedFile, { foreignKey: 'jobId', onDelete: 'CASCADE' });
    UploadedFile.belongsTo(ReconciliationJob, { foreignKey: 'jobId' });

    // Um trabalho de reconciliação tem muitas transações
    ReconciliationJob.hasMany(Transaction, { foreignKey: 'jobId', onDelete: 'CASCADE' });
    Transaction.belongsTo(ReconciliationJob, { foreignKey: 'jobId' });

    // Uma conta bancária pode ter muitas transações
    BankAccount.hasMany(Transaction, { foreignKey: 'bankAccountId' });
    Transaction.belongsTo(BankAccount, { foreignKey: 'bankAccountId' });
    
    // Um ficheiro pode originar muitas transações
    UploadedFile.hasMany(Transaction, { foreignKey: 'fileId' });
    Transaction.belongsTo(UploadedFile, { foreignKey: 'fileId' });

    // Um trabalho de reconciliação tem muitos matches
    ReconciliationJob.hasMany(ReconciliationMatch, { foreignKey: 'jobId', onDelete: 'CASCADE' });
    ReconciliationMatch.belongsTo(ReconciliationJob, { foreignKey: 'jobId' });

    // Um match liga duas transações
    ReconciliationMatch.belongsTo(Transaction, { as: 'bankTransaction', foreignKey: 'bankTransactionId' });
    ReconciliationMatch.belongsTo(Transaction, { as: 'erpTransaction', foreignKey: 'erpTransactionId' });

    console.log('Associações entre modelos aplicadas.');
}

module.exports = { applyAssociations };
