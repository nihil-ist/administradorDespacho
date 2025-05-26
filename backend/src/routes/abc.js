const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// Ruta para agregar un nuevo usuario (Alta)
router.post('/add', async (req, res) => {
    const { usuario, correo, contrasena, tipo, nombre } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await Test.findOne({ usuario });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario
        const newUser = new Test({ usuario, correo, contrasena, tipo, nombre });
        await newUser.save();

        res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (err) {
        console.error('Error al crear el usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// Ruta para eliminar un usuario (Baja)
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar y eliminar al usuario por ID
        const deletedUser = await Test.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente', user: deletedUser });
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// Ruta para actualizar un usuario (Cambio)
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario, correo, contrasena, tipo } = req.body;

    try {
        // Buscar al usuario por ID y actualizarlo
        const updatedUser = await Test.findByIdAndUpdate(id, { usuario, correo, contrasena, tipo }, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (err) {
        console.error('Error al actualizar el usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// Ruta para obtener el ID de un usuario basado en el nombre de usuario y correo
router.post('/getId', async (req, res) => {
    const { usuario, correo } = req.body;

    try {
        const user = await Test.findOne({ usuario, correo });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ id: user._id });
    } catch (err) {
        console.error('Error al buscar el usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// Ruta para obtener todos los usuarios
router.get('/getUsers', async (req, res) => {
    try {
        const users = await Test.find(); // Obtiene todos los registros de la colección
        res.status(200).json(users);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error al obtener los usuarios', error: err.message });
    }
});


module.exports = router;
