const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/roles');
const ApiError = require('../utils/ApiError');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token de autenticação inválido ou expirado.' });
        }
        req.user = user;
        next();
    });
};

// 2. Verifica o Papel (Autorização)
// Exemplo de uso: checkRole([ROLES.ADMIN, ROLES.GESTOR])
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new ApiError(403, 'Acesso Negado', 'Papel do usuário não definido.', '/rbac', 'NO_ROLE'));
        }

        // Se o usuário for Super Admin, tem acesso a tudo (God Mode)
        if (req.user.role === ROLES.SUPER_ADMIN) {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, 'Acesso Negado', `O seu perfil (${req.user.role}) não tem permissão para esta ação.`, '/rbac', 'FORBIDDEN_ROLE'));
        }

        next();
    };
};


module.exports = { authenticateToken, checkRole };
