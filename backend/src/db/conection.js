const mongoose = require('mongoose');

// Usa URI provista por entorno (CI/local) y cae a local por defecto.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testDespacho';

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`Conexión a MongoDB exitosa: ${MONGO_URI}`);
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
        process.exit(1);
    });

module.exports = mongoose;
