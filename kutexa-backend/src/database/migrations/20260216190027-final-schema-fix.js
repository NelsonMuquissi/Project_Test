'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Limpeza (Para garantir que não há conflitos)
      // Removemos tabelas na ordem inversa para não violar chaves estrangeiras
      await queryInterface.dropTable('reconciliation_matches', { cascade: true, transaction });
      await queryInterface.dropTable('transactions', { cascade: true, transaction });
      await queryInterface.dropTable('uploaded_files', { cascade: true, transaction });
      await queryInterface.dropTable('reconciliation_jobs', { cascade: true, transaction });
      await queryInterface.dropTable('refresh_tokens', { cascade: true, transaction });
      await queryInterface.dropTable('licenses', { cascade: true, transaction });
      await queryInterface.dropTable('company_users', { cascade: true, transaction });
      await queryInterface.dropTable('bank_accounts', { cascade: true, transaction });
      await queryInterface.dropTable('users', { cascade: true, transaction });
      await queryInterface.dropTable('companies', { cascade: true, transaction });

      // Limpar todos os ENUMs órfãos
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_uploaded_files_sourceType";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transactions_type";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transactions_sourceType";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transactions_status";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reconciliation_jobs_status";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reconciliation_matches_status";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reconciliation_matches_matchType";', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_licenses_plan";', { transaction });

      // 2. CRIAÇÃO DAS TABELAS

      // COMPANIES
      await queryInterface.createTable('companies', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        nif: { type: Sequelize.STRING, allowNull: false, unique: true },
        defaultCurrency: { type: Sequelize.STRING(3), defaultValue: 'AOA' },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // USERS
      await queryInterface.createTable('users', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        phone_number: { type: Sequelize.STRING, allowNull: false, unique: true },
        role: { 
            type: Sequelize.ENUM('super_admin', 'admin', 'gestor', 'analista'),
            defaultValue: 'analista',
            allowNull: false 
        },
        emailConfirmed: { type: Sequelize.BOOLEAN, defaultValue: false },
        confirmationToken: { type: Sequelize.STRING },
        confirmationTokenExpires: { type: Sequelize.DATE },
        hasCompletedOnboarding: { type: Sequelize.BOOLEAN, defaultValue: false },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // COMPANY_USERS
      await queryInterface.createTable('company_users', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        userId: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        companyId: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
        role: { type: Sequelize.STRING, defaultValue: 'analista' }, // Deixar STRING aqui para flexibilidade
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // LICENSES
      await queryInterface.createTable('licenses', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        userId: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        key: { type: Sequelize.STRING, unique: true, allowNull: false },
        plan: { type: Sequelize.ENUM('free', 'pro', 'enterprise'), defaultValue: 'free' },
        status: { type: Sequelize.STRING, defaultValue: 'active' },
        isActive: { type: Sequelize.BOOLEAN, defaultValue: false },
        expiresAt: { type: Sequelize.DATE },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // RECONCILIATION JOBS
      await queryInterface.createTable('reconciliation_jobs', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        companyId: { type: Sequelize.UUID, allowNull: false, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
        userId: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
        status: { type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'), defaultValue: 'pending' },
        periodStart: { type: Sequelize.DATEONLY },
        periodEnd: { type: Sequelize.DATEONLY },
        summary: { type: Sequelize.JSONB },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // UPLOADED FILES (CORRIGIDA)
      await queryInterface.createTable('uploaded_files', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        jobId: { type: Sequelize.UUID, allowNull: false, references: { model: 'reconciliation_jobs', key: 'id' }, onDelete: 'CASCADE' },
        originalName: { type: Sequelize.STRING, allowNull: false },
        storageName: { type: Sequelize.STRING },
        fileUrl: { type: Sequelize.STRING },
        path: { type: Sequelize.STRING },
        mimeType: { type: Sequelize.STRING },
        size: { type: Sequelize.INTEGER },
        sourceType: {
          // AQUI ESTÁ O SEGREDO: erp_ledger adicionado
          type: Sequelize.ENUM('bank_statement', 'erp_ledger', 'erp_template'), 
          allowNull: false
        },
        status: { type: Sequelize.STRING, defaultValue: 'uploaded' },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // BANK ACCOUNTS
      await queryInterface.createTable('bank_accounts', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        companyId: { type: Sequelize.UUID, allowNull: false, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
        bankName: { type: Sequelize.STRING, allowNull: false },
        accountNumber: { type: Sequelize.STRING, allowNull: false },
        iban: { type: Sequelize.STRING },
        currency: { type: Sequelize.STRING(3), defaultValue: 'AOA' },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // TRANSACTIONS (CORRIGIDA)
      await queryInterface.createTable('transactions', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        jobId: { type: Sequelize.UUID, allowNull: false, references: { model: 'reconciliation_jobs', key: 'id' }, onDelete: 'CASCADE' },
        fileId: { type: Sequelize.UUID, references: { model: 'uploaded_files', key: 'id' }, onDelete: 'SET NULL' },
        bankAccountId: { type: Sequelize.UUID, references: { model: 'bank_accounts', key: 'id' }, onDelete: 'SET NULL' },
        date: { type: Sequelize.DATEONLY, allowNull: false },
        description: { type: Sequelize.TEXT },
        amount: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
        currency: { type: Sequelize.STRING(3), defaultValue: 'AOA' },
        type: { type: Sequelize.ENUM('debit', 'credit') },
        sourceType: { type: Sequelize.ENUM('bank', 'erp'), allowNull: false },
        status: {
          // AQUI ESTÁ O SEGREDO: status extra adicionados para suportar a lógica do controller
          type: Sequelize.ENUM('pending', 'matched', 'unreconciled', 'reconciled', 'pending_review'),
          defaultValue: 'pending'
        },
        originalData: { type: Sequelize.JSONB },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // RECONCILIATION MATCHES
      await queryInterface.createTable('reconciliation_matches', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        jobId: { type: Sequelize.UUID, allowNull: false, references: { model: 'reconciliation_jobs', key: 'id' }, onDelete: 'CASCADE' },
        bankTransactionId: { type: Sequelize.UUID, allowNull: false, references: { model: 'transactions', key: 'id' } },
        erpTransactionId: { type: Sequelize.UUID, allowNull: false, references: { model: 'transactions', key: 'id' } },
        confidenceScore: { type: Sequelize.FLOAT, allowNull: false },
        matchType: { type: Sequelize.ENUM('automatic', 'suggested', 'manual'), defaultValue: 'suggested' },
        status: { type: Sequelize.ENUM('confirmed', 'rejected', 'pending', 'suggested'), defaultValue: 'pending' },
        explanation: { type: Sequelize.TEXT },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      // REFRESH TOKENS
      await queryInterface.createTable('refresh_tokens', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        token: { type: Sequelize.STRING, allowNull: false, unique: true },
        userId: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        expiresAt: { type: Sequelize.DATE }, // Standardize
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop all tables
    await queryInterface.dropTable('reconciliation_matches');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('uploaded_files');
    await queryInterface.dropTable('reconciliation_jobs');
    await queryInterface.dropTable('bank_accounts');
    await queryInterface.dropTable('company_users');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('licenses');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('companies');
  }
};