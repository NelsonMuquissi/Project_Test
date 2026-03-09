const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ReconciliationJob = require('./ReconciliationJob');
const Transaction = require('./Transaction');

const ReconciliationMatch = sequelize.define('ReconciliationMatch', {
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
  bankTransactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Transaction,
      key: 'id'
    }
  },
  erpTransactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Transaction,
      key: 'id'
    }
  },
  confidenceScore: {
    type: DataTypes.FLOAT, 
    allowNull: false
  },
  matchType: {
    type: DataTypes.ENUM('automatic', 'suggested', 'manual'),
    defaultValue: 'suggested'
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'rejected', 'pending'),
    defaultValue: 'pending'
  },
  explanation: {
    type: DataTypes.TEXT 
  }
}, {
  tableName: 'reconciliation_matches',
  timestamps: true
});

module.exports = ReconciliationMatch;
