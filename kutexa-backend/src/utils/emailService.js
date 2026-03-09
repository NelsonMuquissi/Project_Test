const mailer = require('../config/mailer');
require('dotenv').config();

const sendConfirmationEmail = async (userEmail, confirmationLink, userName = 'Usuário') => {
  
  if (process.env.ENABLE_EMAIL_SERVICE !== 'true') {
    console.log(`[EMAIL SERVICE] ⏭️ Envio de confirmação para ${userEmail} ignorado (Serviço Desactivado).`);
    return true;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@kutexa.com',
    to: userEmail,
    subject: 'Confirme o seu E-mail',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Bem-vindo, ${userName}!</h2>
        <p>Por favor clique no botão para confirmar o seu e-mail:</p>
        <p><a href="${confirmationLink}" style="background:#0b66c3;color:#fff;padding:10px 16px;border-radius:5px;text-decoration:none;">Confirmar E-mail</a></p>
        <p>Se não funcionar, cole este link no navegador:</p><p>${confirmationLink}</p>
      </div>
    `,
    text: `Olá ${userName}, confirme o seu e-mail visitando: ${confirmationLink}`
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    
    // Verificação de Ethereal (mantida)
    try {
      const nodemailer = require('nodemailer');
      if (info && !info.skipped && nodemailer.getTestMessageUrl) {
        const preview = nodemailer.getTestMessageUrl(info && info[0] ? info[0] : info);
        if (preview) console.log('E-mail preview URL:', preview);
      }
    } catch (e) { /* ignore */ }

    console.log(`E-mail de confirmação enviado para ${userEmail}`);
    return info;
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    // Em produção, talvez não queiramos dar throw e parar o registro, apenas logar erro.
    // Mas mantive o throw conforme seu original.
    throw err;
  }
};


module.exports = { sendConfirmationEmail };