const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReconciliationJob = sequelize.define('ReconciliationJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  summary: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'reconciliation_jobs',
  timestamps: true
});

module.exports = ReconciliationJob;
