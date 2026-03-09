const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true
});

RefreshToken.verifyExpiration = (token) => {
    return token.expiresAt.getTime() < new Date().getTime();
};

RefreshToken.createToken = async function (user, transaction = null) {
  const expiresInSeconds = Number(process.env.JWT_REFRESH_EXPIRATION || 604800);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  const token = uuidv4();

  const refreshToken = await this.create({
    token,
    userId: user.id,
    expiresAt: expiresAt
  }, transaction ? { transaction } : {});

  return refreshToken.token;
};

module.exports = RefreshToken;
