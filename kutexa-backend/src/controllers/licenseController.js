const License = require('../models/License');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const activateLicense = async (req, res, next) => {
    const { licenseKey } = req.body;
    const userId = req.user.id;

    try {
        if (!licenseKey) {
            throw new ApiError(400, 'Entrada Inválida', 'A chave de licença é obrigatória.', '/validation-error', 'MISSING_LICENSE_KEY');
        }

        const license = await License.findOne({ where: { key: licenseKey } });

        if (!license) {
            throw new ApiError(404, 'Recurso Não Encontrado', 'Chave de licença inválida.', '/resource-not-found', 'INVALID_LICENSE_KEY');
        }

        if (license.isActive || license.userId) {
            throw new ApiError(409, 'Conflito de Recurso', 'Chave de licença já utilizada.', '/resource-conflict', 'LICENSE_KEY_IN_USE');
        }

        license.userId = userId;
        license.isActive = true;
        await license.save();

        return res.status(200).json({
            message: 'Licença ativada com sucesso!',
            license: {
                plan: license.plan,
                expiresAt: license.expiresAt
            }
        });

    } catch (error) {
        next(error);
    }
};

const getMyLicense = async (req, res, next) => { // Adicionar 'next'
    const userId = req.user.id;
    try {
        const license = await License.findOne({ where: { userId: userId, isActive: true } });
        if (!license) {
            throw new ApiError(404, 'Recurso Não Encontrado', 'Nenhuma licença ativa encontrada para este usuário.', '/resource-not-found', 'NO_ACTIVE_LICENSE');
        }
        return res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    activateLicense,
    getMyLicense,
};
