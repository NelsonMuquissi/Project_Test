const crypto = require('crypto');

const generateEmailConfirmationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    generateEmailConfirmationToken
};
