const cron = require('node-cron');
const { AgendaEvent } = require('../models/AgendaEvent');
const { sendEmail, isEmailConfigured } = require('../services/emailService');

const REMINDER_WINDOWS = [
  { id: '24H', minutes: 24 * 60, label: '24 horas antes' },
  { id: '6H', minutes: 6 * 60, label: '6 horas antes' },
  { id: '1H', minutes: 60, label: '1 hora antes' },
  { id: '15M', minutes: 15, label: '15 minutos antes' },
];

const minutesDiff = (futureDate, referenceDate) => {
  return Math.floor((futureDate.getTime() - referenceDate.getTime()) / 60000);
};

const formatDateTime = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
};

const buildEmailBody = (user, windowLabel, events) => {
  const greetingName = user.nombre || user.usuario || 'Usuario';
  const subject = `Recordatorio ${windowLabel} · ${events.length === 1 ? events[0].titulo : 'Agenda'}`;

  const eventsListHtml = events
    .map((event) => {
      const expedienteInfo = event.expediente
        ? `<li><strong>Expediente:</strong> ${event.expediente.numeroControl} · ${event.expediente.titulo}</li>`
        : '';

      return `
        <li style="margin-bottom: 12px;">
          <p style="margin: 0;"><strong>${event.titulo}</strong></p>
          <ul style="margin: 4px 0 0 16px; padding: 0; list-style: disc;">
            <li><strong>Fecha:</strong> ${formatDateTime(event.fechaInicio)}</li>
            <li><strong>Tipo:</strong> ${event.tipo}</li>
            ${expedienteInfo}
            ${event.ubicacion ? `<li><strong>Ubicación:</strong> ${event.ubicacion}</li>` : ''}
          </ul>
        </li>
      `;
    })
    .join('');

  const html = `
    <p>Hola ${greetingName},</p>
    <p>Este es un recordatorio ${windowLabel} para tus eventos programados:</p>
    <ol style="padding-left: 20px;">
      ${eventsListHtml}
    </ol>
    <p>¡Mucho éxito!</p>
    <p><strong>Administrador de Despacho</strong></p>
  `;

  const text = [
    `Hola ${greetingName},`,
    `Recordatorio ${windowLabel} para tus eventos:`,
    ...events.map((event) => {
      const lines = [
        `· ${event.titulo} (${formatDateTime(event.fechaInicio)})`,
        `  Tipo: ${event.tipo}`,
      ];
      if (event.expediente) {
        lines.push(`  Expediente: ${event.expediente.numeroControl} · ${event.expediente.titulo}`);
      }
      if (event.ubicacion) {
        lines.push(`  Ubicación: ${event.ubicacion}`);
      }
      return lines.join('\n');
    }),
    '',
    'Administrador de Despacho',
  ].join('\n');

  return { subject, html, text };
};

const scheduleAgendaReminders = () => {
  if (!isEmailConfigured()) {
    console.warn('[agendaReminders] SMTP no configurado, los recordatorios se omitirán.');
    return null;
  }

  const task = cron.schedule(
    '* * * * *',
    async () => {
    const now = new Date();
    const maxWindowMinutes = Math.max(...REMINDER_WINDOWS.map((window) => window.minutes));
    const horizon = new Date(now.getTime() + maxWindowMinutes * 60000 + 5 * 60000);

    try {
      const events = await AgendaEvent.find({
        fechaInicio: { $gte: now, $lte: horizon },
      })
        .populate({ path: 'propietario', select: 'nombre correo usuario tipo' })
        .populate({ path: 'expediente', select: 'numeroControl titulo abogadoAsignado' })
        .lean();

      if (!events.length) {
        return;
      }

      const remindersByUser = new Map();

      events.forEach((event) => {
        if (!event?.propietario?.correo) {
          return;
        }

        const diffMinutes = minutesDiff(new Date(event.fechaInicio), now);

        REMINDER_WINDOWS.forEach((window) => {
          if (
            diffMinutes <= window.minutes &&
            diffMinutes >= 0 &&
            !event.recordatoriosEnviados?.includes(window.id)
          ) {
            const key = `${event.propietario._id.toString()}-${window.id}`;
            if (!remindersByUser.has(key)) {
              remindersByUser.set(key, {
                user: event.propietario,
                window,
                events: [],
              });
            }
            remindersByUser.get(key).events.push(event);
          }
        });
      });

      for (const [, reminder] of remindersByUser) {
        const { subject, html, text } = buildEmailBody(reminder.user, reminder.window.label, reminder.events);

        const sent = await sendEmail({
          to: reminder.user.correo,
          subject,
          html,
          text,
        });

        if (!sent) {
          console.warn('[agendaReminders] No se pudo enviar recordatorio a', reminder.user.correo);
          continue;
        }

        await Promise.all(
          reminder.events.map((event) =>
            AgendaEvent.updateOne(
              { _id: event._id },
              { $addToSet: { recordatoriosEnviados: reminder.window.id } }
            )
          )
        );
      }
    } catch (error) {
      console.error('[agendaReminders] Error al procesar recordatorios:', error);
    }
    },
    {
      timezone: process.env.TZ || 'America/Mexico_City',
    }
  );

  console.log('[agendaReminders] Tarea de recordatorios programada (cada minuto).');
  return task;
};

module.exports = {
  scheduleAgendaReminders,
};
