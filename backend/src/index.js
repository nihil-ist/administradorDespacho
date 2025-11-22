require('dotenv').config();

const express = require('express');
const cors = require('cors');

require('./db/conection');

const { scheduleAgendaReminders } = require('./jobs/agendaReminders');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const authRoutes = require('./routes/login');
const userRoutes = require('./routes/users');
const expedientesRoutes = require('./routes/expedientes');
const agendaRoutes = require('./routes/agenda');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expedientes', expedientesRoutes);
app.use('/api/agenda', agendaRoutes);

app.get('/', (_req, res) => {
    res.status(200).json({ message: 'API Administrador Despacho operativo' });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const reminderTaskEnabled = process.env.ENABLE_AGENDA_REMINDERS !== 'false';

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    if (reminderTaskEnabled) {
        scheduleAgendaReminders();
    } else {
        console.log('[agendaReminders] La tarea está deshabilitada mediante ENABLE_AGENDA_REMINDERS=false');
    }
});
