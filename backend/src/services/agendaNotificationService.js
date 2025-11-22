const { sendEmail, isEmailConfigured } = require('./emailService');

const formatDateTime = (isoDate) => {
  if (!isoDate) {
    return 'Sin fecha';
  }

  return new Date(isoDate).toLocaleString(process.env.LOCALE || 'es-MX', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: process.env.TZ || 'America/Mexico_City',
  });
};

const buildCreationEmail = (user, event) => {
  const greetingName = user?.nombre || user?.usuario || 'Colega';

  const expedienteLine = event?.expediente
    ? `<li><strong>Expediente:</strong> ${event.expediente.numeroControl} · ${event.expediente.titulo}</li>`
    : '';

  const ubicacionLine = event?.ubicacion
    ? `<li><strong>Ubicación:</strong> ${event.ubicacion}</li>`
    : '';

  const descripcionLine = event?.descripcion
    ? `<p style="margin-top: 16px;"><strong>Notas:</strong> ${event.descripcion}</p>`
    : '';

  const html = `
    <p>Hola ${greetingName},</p>
    <p>Se registró un nuevo evento en tu agenda:</p>
    <ul style="padding-left: 20px;">
      <li><strong>Título:</strong> ${event.titulo}</li>
      <li><strong>Fecha y hora:</strong> ${formatDateTime(event.fechaInicio)}</li>
      <li><strong>Tipo:</strong> ${event.tipo}</li>
      ${expedienteLine}
      ${ubicacionLine}
    </ul>
    ${descripcionLine}
    <p>Este correo se envía automáticamente para que no pierdas de vista tus compromisos.</p>
    <p><strong>Administrador de Despacho</strong></p>
  `;

  const textLines = [
    `Hola ${greetingName},`,
    'Se registró un nuevo evento en tu agenda:',
    `• Título: ${event.titulo}`,
    `• Fecha y hora: ${formatDateTime(event.fechaInicio)}`,
    `• Tipo: ${event.tipo}`,
  ];

  if (event?.expediente) {
    textLines.push(`• Expediente: ${event.expediente.numeroControl} · ${event.expediente.titulo}`);
  }

  if (event?.ubicacion) {
    textLines.push(`• Ubicación: ${event.ubicacion}`);
  }

  if (event?.descripcion) {
    textLines.push(`Notas: ${event.descripcion}`);
  }

  textLines.push('', 'Administrador de Despacho');

  return {
    subject: `Nuevo evento registrado: ${event.titulo}`,
    html,
    text: textLines.join('\n'),
  };
};

const sendImmediateEventEmail = async (user, event) => {
  if (!isEmailConfigured()) {
    return false;
  }

  if (!user?.correo) {
    return false;
  }

  try {
    const { subject, html, text } = buildCreationEmail(user, event);
    await sendEmail({
      to: user.correo,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error('[agendaNotificationService] Error al enviar correo de creación:', error);
    return false;
  }
};

module.exports = {
  sendImmediateEventEmail,
};
