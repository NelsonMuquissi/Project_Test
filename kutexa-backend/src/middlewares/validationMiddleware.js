const Joi = require('joi');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    const objectToValidate = {};
    if (schema.body) objectToValidate.body = req.body;
    if (schema.query) objectToValidate.query = req.query;
    if (schema.params) objectToValidate.params = req.params;

    const { value, error } = Joi.compile(schema).prefs({ errors: { label: 'key' }, abortEarly: false }).validate(objectToValidate);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return next(new ApiError(400, 'Erro de Validação', errorMessage, '/validation-error', 'INVALID_INPUT'));
    }

    Object.assign(req, value);
    return next();
};

module.exports = validate;

