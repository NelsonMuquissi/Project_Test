require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { sequelize } = require('./config/database'); // Removido testConnection que já não existe
const { applyAssociations } = require('./models/associations');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swaggerConfig');

// --- Importação das Rotas ---
const authRoutes = require('./routes/authRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const reconciliationJobRoutes = require('./routes/reconciliationJobRoutes');
const reconciliationMatchRoutes = require('./routes/reconciliationMatchRoutes');
// Certifica-te que estes ficheiros existem, senão comenta as linhas abaixo:
const templateRoutes = require('./routes/templateRoutes');
const validationRoutes = require('./routes/validationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração dos Middlewares ---
app.use(helmet());

// --- CONFIGURAÇÃO DO CORS DINÂMICA ---
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.BACKEND_URL,
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:3000'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir requisições sem origem (como mobile apps ou curl)
        // OU se a origem estiver na lista de permitidos
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Bloqueado pelo CORS: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// Rota de health-check
app.get('/', (req, res) => {
    res.send('API Kutexa está no ar!');
});

// Middleware de Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas tentativas de login a partir deste IP. Por favor, tente novamente após 15 minutos.' }
});

// --- Rota da Documentação ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Aplicar o rate limiter apenas nas rotas de autenticação
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// --- Montagem das Rotas da API ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/licenses', licenseRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/reconciliation-jobs', reconciliationJobRoutes);
app.use('/api/v1/reconciliation-matches', reconciliationMatchRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/validations', validationRoutes);

// --- Middleware de Gestão de Erros (Deve ser o último) ---
app.use(errorHandler);

// --- Função de Inicialização do Servidor ---
const startServer = async () => {
    try {
        // Testar conexão antes de subir o servidor
        await sequelize.authenticate();
        console.log('✅ Conexão com a base de dados estabelecida com sucesso.');

        applyAssociations();
        console.log('✅ Associações entre modelos aplicadas.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📄 Documentação Swagger: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Falha crítica ao iniciar o servidor:', error);
    }
};

startServer();