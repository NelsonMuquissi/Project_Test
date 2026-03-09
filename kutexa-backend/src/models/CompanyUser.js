const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanyUser = sequelize.define('CompanyUser', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'gestor', 'analista'),
        allowNull: false,
        defaultValue: 'analista'
    }
}, {
    tableName: 'company_users',
    timestamps: true
});

module.exports = CompanyUser;
