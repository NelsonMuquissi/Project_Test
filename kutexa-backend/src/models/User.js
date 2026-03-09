    const { DataTypes } = require('sequelize');
    const { sequelize } = require('../config/database');
    const bcrypt = require('bcryptjs');
    const { ROLES } = require('../config/roles'); // Importar as roles

    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // --- NOVO CAMPO: ROLE (Essencial para o PDF) ---
        role: {
            type: DataTypes.ENUM(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GESTOR, ROLES.ANALISTA),
            defaultValue: ROLES.ANALISTA,
            allowNull: false
        },
        // ----------------------------------------------
        emailConfirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confirmationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        confirmationTokenExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        hasCompletedOnboarding: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },{
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    User.prototype.comparePassword = async function(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    module.exports = User;