const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UploadedFile = sequelize.define('UploadedFile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    originalName: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    storageName: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '' 
    },
    mimeType: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    size: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'error'),
        defaultValue: 'uploaded'
    },
    sourceType: {
        type: DataTypes.ENUM('bank_statement', 'erp_template', 'erp_ledger'),
        allowNull: false,
        defaultValue: 'bank_statement'
    }
}, {
    tableName: 'uploaded_files',
    timestamps: true
});

module.exports = UploadedFile;
