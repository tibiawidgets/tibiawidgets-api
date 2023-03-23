const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(sendto, subject, message) {
  // Configuración del servicio de correo electrónico
  let transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    port: 465,
    auth: {
      user: "no-reply@tibiawidgets.com",
      pass: process.env.MAIL_SENDER_PASSWORD,
    },
  });

  // Configuración del correo electrónico
  let mailOptions = {
    from: "no-reply@tibiawidgets.com",
    to: sendto,
    subject: subject,
    text: message,
  };

  // Envío del correo electrónico
  let info = await transporter.sendMail(mailOptions);
  console.log("Correo enviado: ", info.messageId);
}

module.exports = sendEmail;
