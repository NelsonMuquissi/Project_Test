require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Adding columns...');
        await sequelize.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);');
        await sequelize.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(255);');
        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}
run();
