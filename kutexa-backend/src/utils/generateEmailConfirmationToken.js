const jwt = require("jsonwebtoken");

function generateEmailConfirmationToken(userId) {
  return jwt.sign(
    {
      id: userId,
      type: "email_confirmation"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h"
    }
  );
}

module.exports = generateEmailConfirmationToken;
