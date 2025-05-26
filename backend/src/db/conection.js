const mongoose = require('mongoose');

const DB_USER = 'Ivansios';
const DB_PASSWORD = 'holadiegoalex';
const DB_NAME = 'testDespacho';
const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@despachotest.a3dt5.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Conexión a MongoDB Atlas exitosa');
})
.catch((err) => {
    console.error('Error al conectar a MongoDB Atlas:', err);
});

module.exports = mongoose;
