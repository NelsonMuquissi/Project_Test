const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ReconciliationJob = require('./ReconciliationJob');
const UploadedFile = require('./UploadedFile');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ReconciliationJob,
      key: 'id'
    }
  },
  fileId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: UploadedFile,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'AOA'
  },
  type: {
    type: DataTypes.ENUM('debit', 'credit'),
    allowNull: true
  },
  sourceType: {
    type: DataTypes.ENUM('bank', 'erp'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'unreconciled'),
    defaultValue: 'pending'
  },
  originalData: {
    type: DataTypes.JSONB 
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['jobId', 'amount']
    },
    {
      fields: ['jobId', 'date']
    }
  ]
});

module.exports = Transaction;
