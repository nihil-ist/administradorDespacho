const express = require('express');
const cors = require('cors');

require('./db/conection');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const authRoutes = require('./routes/login');
const userRoutes = require('./routes/users');
const expedientesRoutes = require('./routes/expedientes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expedientes', expedientesRoutes);

app.get('/', (_req, res) => {
    res.status(200).json({ message: 'API Administrador Despacho operativo' });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
