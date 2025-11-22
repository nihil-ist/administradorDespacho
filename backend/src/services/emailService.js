const nodemailer = require('nodemailer');

let cachedTransporter = null;

const ensureTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SECURE } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('[emailService] Configuración SMTP incompleta. Se omitirá el envío de correos.');
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return cachedTransporter;
};

const isEmailConfigured = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  return Boolean(EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS);
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = ensureTransporter();

  if (!transporter) {
    return false;
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('[emailService] Error al enviar correo:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  isEmailConfigured,
};
