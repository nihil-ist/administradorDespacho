const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { User } = require('../models/User');

// Ruta de login
router.post('/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        if (!usuario || !contrasena) {
            return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
        }

            const user = await User.findOne({ usuario: usuario.trim() });

            if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

            const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }

            if (user.activo === false) {
            return res.status(403).json({ message: 'El usuario está deshabilitado. Contacta al administrador.' });
        }

            const { contrasena: _, ...usuarioSinPassword } = user.toObject();
        res.status(200).json({ message: 'Login exitoso', user: usuarioSinPassword });
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

module.exports = router;
