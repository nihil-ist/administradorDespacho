const express = require('express');
const router = express.Router();
const Test = require('../models/Test');  // Importa el modelo de la colección "test"

// Ruta de login
router.post('/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // Busca al usuario por nombre de usuario y contraseña
        const user = await Test.findOne({ usuario, contrasena });

        if (user) {
            res.status(200).json({ message: 'Login exitoso', user });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;
