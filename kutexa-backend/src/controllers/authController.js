const { sequelize } = require('../config/database');
const User = require('../models/User');
const License = require('../models/License');
const RefreshToken = require('../models/RefreshToken');
const { generateEmailConfirmationToken } = require('../utils/tokenUtils');
const { sendConfirmationEmail } = require('../utils/emailService');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Funcao para registrar um novo usuario
const register = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { name, email, password, phone_number } = req.body;

        if (!name || !email || !password || !phone_number) {
            throw new ApiError(400, 'Entrada Inválida', 'Todos os campos são obrigatórios', '/validation-error', 'MISSING_FIELDS');
        }

        let cleanPhone = phone_number.replace(/[\s-]/g, '');

        if (cleanPhone.startsWith('00244')) {
            cleanPhone = '+' + cleanPhone.substring(2);
        } else if (cleanPhone.startsWith('244') && cleanPhone.length === 12) {
            cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
            cleanPhone = '+244' + cleanPhone;
        }

        const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { phone_number: cleanPhone }] } });

        if (existingUser) {
            throw new ApiError(409, 'Conflito', 'E-mail ou número de telefone já registado.', '/resource-conflict', 'USER_ALREADY_EXISTS');
        }

        const shouldAutoConfirm = process.env.ENABLE_EMAIL_SERVICE !== 'true';

        const confirmationToken = generateEmailConfirmationToken();
        const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

        const user = await User.create({
            name,
            email,
            password,
            phone_number: cleanPhone,
            confirmationToken: shouldAutoConfirm ? null : confirmationToken,
            confirmationTokenExpires: shouldAutoConfirm ? null : tokenExpires,
            emailConfirmed: shouldAutoConfirm
        }, { transaction });

        if (!shouldAutoConfirm) {
            const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
            const confirmationLink = `${baseUrl}/api/v1/auth/confirm-email?token=${encodeURIComponent(confirmationToken)}&email=${encodeURIComponent(email)}`;

            await sendConfirmationEmail(email, confirmationLink, name);
        }

        await transaction.commit();

        const message = shouldAutoConfirm
            ? 'Registo efetuado com sucesso. Pode fazer login.'
            : 'Registo efetuado. Verifique o seu e-mail para confirmar a conta.';

        return res.status(201).json({
            message,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                emailConfirmed: user.emailConfirmed
            }
        });

    } catch (error) {
        await transaction.rollback();
        if (error.message === 'Falha ao enviar e-mail de confirmação.') {
            next(new ApiError(502, 'Erro no Gateway de E-mail', 'Ocorreu um problema ao tentar enviar o e-mail. Registo cancelado.', '/email-error', 'EMAIL_FAILED'));
        } else {
            next(error);
        }
    }
};

// Funcao para logar
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN] Tentiva de login para: ${email}`);
        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.comparePassword(password))) {
            throw new ApiError(401, 'Autenticação Falhou', 'Credenciais inválidas.', '/auth-error', 'INVALID_CREDENTIALS');
        }

        console.log(`[LOGIN] Usuário encontrado: ${user.id}`);

        if (!user.emailConfirmed) {
            console.log(`[LOGIN] E-mail não confirmado: ${email}`);
            throw new ApiError(403, 'Acesso Proibido', 'Por favor, confirme o seu e-mail.', '/access-denied', 'EMAIL_NOT_CONFIRMED');
        }

        console.log(`[LOGIN] Buscando licença ativa...`);
        const activeLicense = await License.findOne({
            where: { userId: user.id, isActive: true }
        });
        const userPlan = activeLicense ? activeLicense.plan : 'free';

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            plan: userPlan,
        };

        console.log(`[LOGIN] Gerando Access Token...`);
        const accessToken = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log(`[LOGIN] Gerando Refresh Token...`);
        const newRefreshToken = await RefreshToken.createToken(user);

        console.log(`[LOGIN] Login bem-sucedido: ${email}`);
        return res.status(200).json({
            access_token: accessToken,
            refresh_token: newRefreshToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: userPlan,
                hasCompletedOnboarding: user.hasCompletedOnboarding
            }
        });
    } catch (error) {
        next(error);
    }
};

// Funcao para confirmar email
const confirmEmail = async (req, res, next) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) {
            throw new ApiError(400, 'Dados em falta', 'Token e email são obrigatórios.', '/validation-error', 'MISSING_PARAMS');
        }

        const user = await User.findOne({
            where: {
                email,
                confirmationToken: token,
                confirmationTokenExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            throw new ApiError(400, 'Inválido', 'Token inválido ou expirado.', '/validation-error', 'INVALID_TOKEN');
        }

        user.emailConfirmed = true;
        user.confirmationToken = null;
        user.confirmationTokenExpires = null;
        await user.save();

        return res.status(200).json({ message: 'E-mail confirmado com sucesso. Você já pode fazer login.' });
    } catch (error) {
        next(error);
    }
};

// Funcao para refresh token
const refreshToken = async (req, res, next) => {
    const { requestToken } = req.body;
    if (!requestToken) return next(new ApiError(400, 'Bad Request', 'Refresh Token obrigatório.', '/auth-error', 'MISSING_TOKEN'));

    try {
        const tokenInDb = await RefreshToken.findOne({ where: { token: requestToken } });
        if (!tokenInDb) return next(new ApiError(403, 'Proibido', 'Refresh Token inválido.', '/auth-error', 'INVALID_REFRESH_TOKEN'));

        if (refreshToken.expiresAt < new Date()) {
            await RefreshToken.destroy({ where: { id: tokenInDb.id } });
            return next(new ApiError(403, 'Proibido', 'Refresh Token expirado.', '/auth-error', 'EXPIRED_REFRESH_TOKEN'));
        }

        const user = await User.findByPk(tokenInDb.userId);

        const activeLicense = await License.findOne({ where: { userId: user.id, isActive: true } });
        const userPlan = activeLicense ? activeLicense.plan : 'free';

        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role, plan: userPlan },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            access_token: newAccessToken,
            refresh_token: tokenInDb.token,
        });

    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await RefreshToken.destroy({ where: { token: refreshToken } });
        }
        return res.status(200).json({ message: 'Logout efetuado com sucesso.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    confirmEmail,
    logout,
    refreshToken
};