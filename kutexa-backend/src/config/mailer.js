require('dotenv').config();
const fromDefault = process.env.EMAIL_FROM || 'no-reply@example.com';

async function createMailjetClient() {
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const priv = process.env.MJ_APIKEY_PRIVATE;
  if (!pub || !priv) return null;

  try {
    const mjLib = require('node-mailjet');
    // mjLib may export .connect or .apiConnect depending on version
    const mailjet = (typeof mjLib.connect === 'function')
      ? mjLib.connect(pub, priv)
      : (typeof mjLib.apiConnect === 'function' ? mjLib.apiConnect(pub, priv) : null);

    if (mailjet) {
      return {
        sendMail: async (mailOptions) => {
          const toList = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
          const messages = [{
            From: { Email: mailOptions.from || fromDefault, Name: process.env.EMAIL_FROM_NAME || 'No Reply' },
            To: toList.map(t => ({ Email: t })),
            Subject: mailOptions.subject,
            HTMLPart: mailOptions.html,
            TextPart: mailOptions.text
          }];
          const body = { Messages: messages };
          const res = await mailjet.post('send', { version: 'v3.1' }).request(body);
          return res;
        }
      };
    } else {
      // If library present but doesn't expose connect, fallback to HTTP below
      console.warn('node-mailjet present but no connect/apiConnect; falling back to HTTP approach.');
      return null;
    }
  } catch (err) {
    console.error('Mailjet client init failed (node-mailjet):', err && err.message ? err.message : err);
    return null;
  }
}

// Fallback: call Mailjet HTTP API directly using axios (no client lib required)
async function createMailjetHttpClient() {
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const priv = process.env.MJ_APIKEY_PRIVATE;
  if (!pub || !priv) return null;

  try {
    const axios = require('axios');
    const auth = Buffer.from(`${pub}:${priv}`).toString('base64');

    return {
      sendMail: async (mailOptions) => {
        const toList = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
        const messages = [{
          From: { Email: mailOptions.from || fromDefault, Name: process.env.EMAIL_FROM_NAME || 'No Reply' },
          To: toList.map(t => ({ Email: t })),
          Subject: mailOptions.subject,
          HTMLPart: mailOptions.html,
          TextPart: mailOptions.text
        }];
        const payload = { Messages: messages };

        const res = await axios.post('https://api.mailjet.com/v3.1/send', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          timeout: 15000
        });
        return res.data;
      }
    };
  } catch (err) {
    console.error('Mailjet HTTP client init failed:', err && err.message ? err.message : err);
    return null;
  }
}

async function createSendinblueClient() {
  const apiKey = process.env.SENDINBLUE_API_KEY;
  if (!apiKey) return null;
  try {
    const SibApiV3Sdk = require('sib-api-v3-sdk');
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    return {
      sendMail: async (mailOptions) => {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { email: mailOptions.from || fromDefault };
        const toList = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
        sendSmtpEmail.to = toList.map(t => ({ email: t }));
        sendSmtpEmail.subject = mailOptions.subject;
        if (mailOptions.html) sendSmtpEmail.htmlContent = mailOptions.html;
        if (mailOptions.text) sendSmtpEmail.textContent = mailOptions.text;
        const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return res;
      }
    };
  } catch (err) {
    console.error('Sendinblue init failed:', err && err.message ? err.message : err);
    return null;
  }
}

async function createNodemailerTransporter() {
  const nodemailer = require('nodemailer');
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        connectionTimeout: 10000
      });
      transporter.verify((error) => {
        if (error) console.error('Gmail SMTP verify error:', error);
      });
      return transporter;
    } catch (err) {
      console.error('Gmail transporter error:', err && err.message ? err.message : err);
    }
  }

  // Ethereal fallback
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('Ethereal account created for dev email testing.');
    return transporter;
  } catch (err) {
    console.error('Ethereal createTestAccount failed:', err && err.message ? err.message : err);
    throw err;
  }
}

let mailClientPromise = (async () => {
  // Try node-mailjet lib first
  const mjLibClient = await createMailjetClient();
  if (mjLibClient) {
    console.log('Mailer: using node-mailjet lib.');
    return mjLibClient;
  }
  // If library missing/invalid, try HTTP client
  const mjHttpClient = await createMailjetHttpClient();
  if (mjHttpClient) {
    console.log('Mailer: using Mailjet HTTP API (axios).');
    return mjHttpClient;
  }
  // Try Sendinblue
  const sib = await createSendinblueClient();
  if (sib) {
    console.log('Mailer: using Sendinblue HTTP API.');
    return sib;
  }
  // Fallback nodemailer
  const nm = await createNodemailerTransporter();
  console.log('Mailer: using Nodemailer fallback.');
  return nm;
})();

module.exports = {
  sendMail: async (mailOptions) => {
    if (process.env.ENABLE_EMAIL_SERVICE !== 'true') {
      console.log(`[MAILER] 🔕 Serviço Desactivado. Email para ${mailOptions.to} foi simulado/ignorado.`);
      return { accepted: mailOptions.to, response: 'Email Service Disabled via ENV', skipped: true };
    }

    const client = await mailClientPromise; 
    
    if (!client) {
        console.error('No mail client available.');
        return null; 
    }

    if (!client.sendMail) {
         throw new Error('Mail client setup failed: sendMail method missing.');
    }

    return client.sendMail(mailOptions);
  }
};