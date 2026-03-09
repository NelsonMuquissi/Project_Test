const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const License = sequelize.define('License', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    plan: {
        type: DataTypes.ENUM('basic', 'pro', 'enterprise'),
        allowNull: false,
        defaultValue: 'basic'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    }
}, {
    tableName: 'licenses',
    timestamps: true
});

module.exports = License;
