const Joi = require('joi');

// Reutilizáveis
const uuidv4 = Joi.string().guid({ version: 'uuidv4' }).message('ID inválido, deve ser um UUID.');
const dateDateOnly = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).message('A data deve estar no formato YYYY-MM-DD.');

// --- ESQUEMAS DE PARÂMETROS (URL) ---

// Para rotas com :jobId
const paramsJobId = {
    params: Joi.object().keys({
        jobId: uuidv4.required()
    })
};

// Para rotas com :companyId
const paramsCompanyId = {
    params: Joi.object().keys({
        companyId: uuidv4.required()
    })
};

// Para rotas com :id (Genérico)
const paramsIdGeneric = {
    params: Joi.object().keys({
        id: uuidv4.required()
    })
};

// Para rotas com :matchId
const paramsMatchId = {
    params: Joi.object().keys({
        matchId: uuidv4.required()
    })
};

// --- ESQUEMAS DE BODY (JSON) ---

const authRegister = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),

        // REGEX EXPLICADO:
        // ^(?:(\+244|00244|244)[\s-]?)? -> Aceita opcionalmente +244, 00244 ou 244 seguido de espaço
        // 9\d{2}  -> Obriga a começar com 9 e mais 2 digitos (ex: 923)
        // [\s-]?  -> Aceita espaço ou traço opcional
        // \d{3}   -> Mais 3 digitos
        // [\s-]?  -> Aceita espaço ou traço opcional
        // \d{3}$  -> Últimos 3 digitos
        phone_number: Joi.string()
            .pattern(/^(?:(\+244|00244|244)[\s-]?)?9\d{2}[\s-]?\d{3}[\s-]?\d{3}$/)
            .required()
            .messages({
                'string.pattern.base': 'Número inválido. Insira um número angolano válido (ex: 923 456 789).'
            })
    })
};

const authLogin = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

const createCompany = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        nif: Joi.string().required(),
        email: Joi.string().email().allow('', null),
        phone: Joi.string().allow('', null),
        defaultCurrency: Joi.string().length(3).uppercase().default('AOA')
    })
};

const uploadReconciliation = {
    body: Joi.object().keys({
        companyId: uuidv4.required(),
        periodStart: dateDateOnly.required(),
        periodEnd: dateDateOnly.required()
    }).unknown(true)
};

const uploadErp = {
    body: Joi.object().keys({
        jobId: uuidv4.required()
    }).unknown(true)
};

const batchMatchAction = {
    body: Joi.object().keys({
        action: Joi.string().valid('confirm', 'reject').required(),
        matchIds: Joi.array().items(uuidv4).min(1).required()
    })
};

module.exports = {
    authRegister,
    authLogin,
    createCompany,
    uploadReconciliation,
    uploadErp,
    batchMatchAction,
    paramsJobId,
    paramsCompanyId,
    paramsIdGeneric,
    paramsMatchId
};