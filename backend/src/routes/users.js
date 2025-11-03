const express = require('express');
const router = express.Router();
const { User, rolesPermitidos } = require('../models/User');

const formatearRespuestaUsuario = (usuario) => {
  const { _id, usuario: username, correo, tipo, nombre, activo, createdAt, updatedAt } = usuario.toObject();
  return { _id, usuario: username, correo, tipo, nombre, activo, createdAt, updatedAt };
};

const normalizarRol = (rol) => (rol ? rol.toString().trim().toUpperCase() : rol);

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.status(200).json(usuarios.map(formatearRespuestaUsuario));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    let { usuario, correo, contrasena, tipo, nombre } = req.body;

    if (!usuario || !correo || !contrasena || !tipo || !nombre) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    tipo = normalizarRol(tipo);

    if (!rolesPermitidos.includes(tipo)) {
      return res.status(400).json({
        message: 'El rol especificado no es válido',
        rolesPermitidos,
      });
    }

    const usuarioExistente = await User.findOne({
      $or: [{ usuario: usuario.trim() }, { correo: correo.trim().toLowerCase() }],
    });

    if (usuarioExistente) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese nombre o correo electrónico',
      });
    }

    const nuevoUsuario = new User({
      usuario: usuario.trim(),
      correo: correo.trim().toLowerCase(),
      contrasena,
      tipo,
      nombre: nombre.trim(),
    });

    const guardado = await nuevoUsuario.save();

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: formatearRespuestaUsuario(guardado),
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(formatearRespuestaUsuario(usuario));
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { usuario, correo, contrasena, tipo, nombre, activo } = req.body;

    const actualizaciones = {};
    if (usuario) actualizaciones.usuario = usuario.trim();
    if (correo) actualizaciones.correo = correo.trim().toLowerCase();
    if (contrasena) actualizaciones.contrasena = contrasena;
    if (typeof activo === 'boolean') actualizaciones.activo = activo;
    if (nombre) actualizaciones.nombre = nombre.trim();
    if (tipo) {
      const rolNormalizado = normalizarRol(tipo);
      if (!rolesPermitidos.includes(rolNormalizado)) {
        return res.status(400).json({ message: 'El rol especificado no es válido', rolesPermitidos });
      }
      actualizaciones.tipo = rolNormalizado;
    }

    const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, actualizaciones, {
      new: true,
      runValidators: true,
    });

    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: formatearRespuestaUsuario(usuarioActualizado),
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'El usuario o correo ya se encuentra en uso' });
    }

    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuarioEliminado = await User.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
      usuario: formatearRespuestaUsuario(usuarioEliminado),
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
});

// Buscar el ID de un usuario
router.post('/lookup', async (req, res) => {
  try {
    const { usuario, correo } = req.body;

    if (!usuario || !correo) {
      return res.status(400).json({ message: 'Usuario y correo son obligatorios' });
    }

    const usuarioEncontrado = await User.findOne({
      usuario: usuario.trim(),
      correo: correo.trim().toLowerCase(),
    });

    if (!usuarioEncontrado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ id: usuarioEncontrado._id });
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    res.status(500).json({ message: 'Error al buscar el usuario', error: error.message });
  }
});

module.exports = router;
