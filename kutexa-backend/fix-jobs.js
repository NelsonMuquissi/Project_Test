const { sequelize } = require('./src/config/database');

async function fixJobTable() {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();

        console.log('Adding matchCount column to reconciliation_jobs...');
        await sequelize.query('ALTER TABLE "reconciliation_jobs" ADD COLUMN IF NOT EXISTS "matchCount" INTEGER DEFAULT 0;');

        console.log('Done!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixJobTable();
