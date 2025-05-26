const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    usuario: { type: String, required: true },
    correo: { type: String, required: true },
    contrasena: { type: String, required: true },
    tipo: { type: String, required: true },
    nombre: { type: String, required: true }
}, { collection: 'test' });  // Se especifica la colección "test"

module.exports = mongoose.model('Test', testSchema);
