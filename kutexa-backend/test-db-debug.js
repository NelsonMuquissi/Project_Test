const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testConnection(url, useSsl) {
    console.log(`Testing connection to ${url} with SSL: ${useSsl}`);
    const options = {
        dialect: 'postgres',
        logging: false,
    };

    if (useSsl) {
        options.dialectOptions = {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        };
    }

    const sequelize = new Sequelize(url, options);

    try {
        await sequelize.authenticate();
        console.log('✅ Connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    } finally {
        await sequelize.close();
    }
}

async function run() {
    const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kutexa';
    console.log('Phase 1: Testing with SSL...');
    const success1 = await testConnection(url, true);

    if (!success1) {
        console.log('Phase 2: Testing WITHOUT SSL...');
        await testConnection(url, false);
    }
}

run();
