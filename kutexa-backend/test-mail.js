const mailer = require("./src/config/mailer");

(async () => {
  await mailer.sendMail({
    to: "teuemail@gmail.com",
    subject: "Teste Mailjet Kutexa",
    html: "<h1>Funcionou 🎉</h1>",
    text: "Funcionou"
  });
})();
