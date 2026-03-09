require('dotenv').config();
const { Sequelize } = require('sequelize');

// Garante que a URL não tem espaços em branco
const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';

if (!dbUrl) {
  throw new Error('DATABASE_URL não definida no .env');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  ssl: true, // <--- Adiciona isto na raiz
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true // <--- Ajuda a manter a conexão estável
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // Aumentar tempo de timeout
    idle: 10000
  }
});

module.exports = { sequelize };