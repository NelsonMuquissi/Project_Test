const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            type: `https://kutexa.com/errors${err.type}`,
            title: err.title,
            status: err.status,
            detail: err.detail,
            message: err.detail, // Compatibilidade
            error: err.title,    // Compatibilidade
            code: err.code,
            instance: req.originalUrl,
        });
        return;
    }

    if (err.name && err.name.startsWith('Sequelize')) {
        res.status(400).json({
            type: 'https://kutexa.com/errors/database-error',
            title: 'Erro de Base de Dados',
            status: 400,
            detail: err.errors ? err.errors[0].message : err.message,
            message: err.errors ? err.errors[0].message : err.message, // Compatibilidade
            error: 'Erro de Base de Dados', // Compatibilidade
            code: 'DB_ERROR',
            instance: req.originalUrl,
        });
        return;
    }

    console.error('ERRO INESPERADO:', err);
    res.status(500).json({
        type: 'https://kutexa.com/errors/internal-server-error',
        title: 'Erro Interno do Servidor',
        status: 500,
        detail: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
        message: 'Ocorreu um erro inesperado.', // Compatibilidade
        error: 'Erro Interno', // Compatibilidade
        code: 'INTERNAL_ERROR',
        instance: req.originalUrl,
    });
}

module.exports = errorHandler;
