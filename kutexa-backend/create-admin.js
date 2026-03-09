const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function createTestAdmin() {
    try {
        await sequelize.authenticate();
        const testUser = await User.findOne({ where: { email: 'admin@kutexa.com' } });
        if (!testUser) {
            await User.create({
                name: 'Admin Kutexa',
                email: 'admin@kutexa.com',
                password: 'password123',
                phone_number: '+244900000000',
                emailConfirmed: true,
                role: 'super_admin'
            });
            console.log('✅ Utilizador admin@kutexa.com (password123) criado com sucesso!');
        } else {
            testUser.password = 'password123';
            await testUser.save();
            console.log('✅ Utilizador admin@kutexa.com já existia. Senha reposta para password123.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
createTestAdmin();
