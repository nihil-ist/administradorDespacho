const express = require('express');
const router = express.Router();
const { Expediente, estadosExpediente } = require('../models/Expediente');

const normalizarEstado = (estado) => (estado ? estado.toString().trim().toUpperCase() : estado);
const normalizarTexto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);

const normalizarArchivos = (archivos = []) =>
  archivos
    .filter((archivo) => archivo && archivo.url && archivo.storagePath)
    .map((archivo) => ({
      nombreOriginal: normalizarTexto(archivo.nombreOriginal || archivo.name),
      url: archivo.url,
      storagePath: archivo.storagePath,
      contentType: archivo.contentType || archivo.mimeType || null,
      size: archivo.size || null,
    }));

const construirFiltro = ({ status, search, assignedTo }) => {
  const filtro = {};

  if (status) {
    const estadoNormalizado = normalizarEstado(status);
    if (!estadosExpediente.includes(estadoNormalizado)) {
      throw new Error('ESTADO_NO_VALIDO');
    }
    filtro.estatus = estadoNormalizado;
  }

  if (search) {
    const termino = search.trim();
    const regex = new RegExp(termino, 'i');
    filtro.$or = [
      { numeroControl: regex },
      { titulo: regex },
      { cliente: regex },
      { abogadoAsignado: regex },
    ];
  }

  if (assignedTo) {
    filtro.abogadoAsignado = assignedTo.trim();
  }

  return filtro;
};

router.get('/', async (req, res) => {
  try {
    const { status, search, limit, assignedTo } = req.query;
    const filtro = construirFiltro({ status, search, assignedTo });
    const limite = limit ? Math.min(Number(limit), 100) : undefined;

    const expedientes = await Expediente.find(filtro)
      .sort({ createdAt: -1 })
      .limit(limite || 0)
      .lean();

    res.status(200).json(expedientes);
  } catch (error) {
    if (error.message === 'ESTADO_NO_VALIDO') {
      return res.status(400).json({ message: 'El estado solicitado no es válido', estadosPermitidos: estadosExpediente });
    }

    console.error('Error al obtener expedientes:', error);
    res.status(500).json({ message: 'Error al obtener los expedientes', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { status, search, assignedTo } = req.query;
    const filtro = construirFiltro({ status, search, assignedTo });

    const pipeline = [];

    if (Object.keys(filtro).length > 0) {
      pipeline.push({ $match: filtro });
    }

    pipeline.push({ $group: { _id: '$estatus', total: { $sum: 1 } } });

    const resultado = await Expediente.aggregate(pipeline);

    const conteo = estadosExpediente.reduce((acc, estado) => {
      const registro = resultado.find((item) => item._id === estado);
      acc[estado] = registro ? registro.total : 0;
      return acc;
    }, {});

    const total = Object.values(conteo).reduce((sum, value) => sum + value, 0);

    res.status(200).json({ total, porEstado: conteo });
  } catch (error) {
    console.error('Error al calcular estadísticas de expedientes:', error);
    res.status(500).json({ message: 'Error al obtener las estadísticas', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id).lean();

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    res.status(200).json(expediente);
  } catch (error) {
    console.error('Error al obtener expediente:', error);
    res.status(500).json({ message: 'Error al obtener el expediente', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      numeroControl,
      cliente,
      abogadoAsignado,
      tipo,
      estatus,
      fechaApertura,
      fechaAudiencia,
      fechaConclusion,
      descripcion,
      notasInternas,
      etiquetas,
      archivos,
      creadoPor,
    } = req.body;

    if (!titulo || !numeroControl || !cliente || !abogadoAsignado || !tipo || !fechaApertura) {
      return res.status(400).json({ message: 'Faltan datos obligatorios para crear el expediente' });
    }

    const estadoNormalizado = normalizarEstado(estatus) || 'EN_PROCESO';
    if (estadoNormalizado && !estadosExpediente.includes(estadoNormalizado)) {
      return res.status(400).json({ message: 'El estado especificado no es válido', estadosPermitidos: estadosExpediente });
    }

    const nuevoExpediente = new Expediente({
      titulo: normalizarTexto(titulo),
      numeroControl: normalizarTexto(numeroControl),
      cliente: normalizarTexto(cliente),
      abogadoAsignado: normalizarTexto(abogadoAsignado),
      tipo: normalizarTexto(tipo),
      estatus: estadoNormalizado,
      fechaApertura,
      fechaAudiencia: fechaAudiencia || null,
      fechaConclusion: fechaConclusion || null,
      descripcion: normalizarTexto(descripcion),
      notasInternas: normalizarTexto(notasInternas),
      etiquetas: Array.isArray(etiquetas) ? etiquetas.map(normalizarTexto) : [],
      archivos: normalizarArchivos(archivos),
      creadoPor: creadoPor || null,
    });

    const guardado = await nuevoExpediente.save();

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      expediente: guardado.toObject(),
    });
  } catch (error) {
    console.error('Error al crear expediente:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ya existe un expediente con ese número de control' });
    }

    res.status(500).json({ message: 'Error al crear el expediente', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const datosActualizados = { ...req.body };

    if (datosActualizados.estatus) {
      const estadoNormalizado = normalizarEstado(datosActualizados.estatus);
      if (!estadosExpediente.includes(estadoNormalizado)) {
        return res.status(400).json({ message: 'El estado especificado no es válido', estadosPermitidos: estadosExpediente });
      }
      datosActualizados.estatus = estadoNormalizado;
    }

    if (datosActualizados.archivos) {
      datosActualizados.archivos = normalizarArchivos(datosActualizados.archivos);
    }

    ['titulo', 'numeroControl', 'cliente', 'abogadoAsignado', 'tipo', 'descripcion', 'notasInternas'].forEach((campo) => {
      if (campo in datosActualizados && typeof datosActualizados[campo] === 'string') {
        datosActualizados[campo] = datosActualizados[campo].trim();
      }
    });

    const expedienteActualizado = await Expediente.findByIdAndUpdate(req.params.id, datosActualizados, {
      new: true,
      runValidators: true,
    }).lean();

    if (!expedienteActualizado) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    res.status(200).json({
      message: 'Expediente actualizado exitosamente',
      expediente: expedienteActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar expediente:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'El número de control ya está en uso por otro expediente' });
    }

    res.status(500).json({ message: 'Error al actualizar el expediente', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expedienteEliminado = await Expediente.findByIdAndDelete(req.params.id).lean();

    if (!expedienteEliminado) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    res.status(200).json({
      message: 'Expediente eliminado correctamente',
      expediente: expedienteEliminado,
    });
  } catch (error) {
    console.error('Error al eliminar expediente:', error);
    res.status(500).json({ message: 'Error al eliminar el expediente', error: error.message });
  }
});

module.exports = router;
