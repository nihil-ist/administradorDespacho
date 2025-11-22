const express = require('express');
const mongoose = require('mongoose');
const { AgendaEvent, tiposEventoAgenda } = require('../models/AgendaEvent');
const { sendImmediateEventEmail } = require('../services/agendaNotificationService');

const router = express.Router();

const { isValidObjectId } = mongoose;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const normalizeTipo = (valor) => {
  if (!valor) {
    return 'OTRO';
  }
  const tipoNormalizado = valor.toString().trim().toUpperCase();
  return tiposEventoAgenda.includes(tipoNormalizado) ? tipoNormalizado : 'OTRO';
};

const parseDate = (valor) => {
  if (!valor) {
    return null;
  }
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const buildFechaInicioFilter = (from, to) => {
  const filtro = {};
  const fechaDesde = parseDate(from);
  const fechaHasta = parseDate(to);

  if (from && !fechaDesde) {
    throw new Error('FECHA_DESDE_INVALIDA');
  }

  if (to && !fechaHasta) {
    throw new Error('FECHA_HASTA_INVALIDA');
  }

  if (fechaDesde) {
    filtro.$gte = fechaDesde;
  }

  if (fechaHasta) {
    filtro.$lte = fechaHasta;
  }

  return Object.keys(filtro).length > 0 ? filtro : null;
};

const mapEventResponse = (evento) => {
  if (!evento) {
    return null;
  }

  const response = { ...evento };
  if (!response.expediente) {
    response.expediente = null;
  }
  if ('recordatoriosEnviados' in response) {
    delete response.recordatoriosEnviados;
  }
  return response;
};

router.get('/', async (req, res) => {
  try {
    const { ownerId, from, to, tipo, limit, upcoming, expedienteId } = req.query;

    const filtro = {};

    if (ownerId && ownerId !== 'ALL') {
      if (!isValidObjectId(ownerId)) {
        return res.status(400).json({ message: 'El identificador del propietario no es válido' });
      }
      filtro.propietario = ownerId;
    }

    if (expedienteId) {
      if (!isValidObjectId(expedienteId)) {
        return res.status(400).json({ message: 'El identificador del expediente no es válido' });
      }
      filtro.expediente = expedienteId;
    }

    if (tipo) {
      filtro.tipo = normalizeTipo(tipo);
    }

    const rangoFecha = buildFechaInicioFilter(from, to);
    if (rangoFecha) {
      filtro.fechaInicio = rangoFecha;
    }

    if (upcoming === 'true') {
      const ahora = new Date();
      filtro.fechaInicio = filtro.fechaInicio || {};
      filtro.fechaInicio.$gte = filtro.fechaInicio.$gte && filtro.fechaInicio.$gte > ahora ? filtro.fechaInicio.$gte : ahora;
    }

    const query = AgendaEvent.find(filtro)
      .sort({ fechaInicio: 1 })
      .populate({ path: 'expediente', select: 'titulo numeroControl abogadoAsignado fechaAudiencia' })
      .lean();

    const limite = limit ? Math.max(1, Math.min(parseInt(limit, 10), 100)) : null;
    if (limite) {
      query.limit(limite);
    }

    const eventos = await query.exec();

    res.status(200).json(eventos.map(mapEventResponse));
  } catch (error) {
    if (error.message === 'FECHA_DESDE_INVALIDA' || error.message === 'FECHA_HASTA_INVALIDA') {
      return res.status(400).json({ message: 'Las fechas proporcionadas no son válidas' });
    }

    console.error('Error al obtener eventos de agenda:', error);
    res.status(500).json({ message: 'Error al obtener la agenda', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'El identificador del evento no es válido' });
  }

  try {
    const evento = await AgendaEvent.findById(id)
      .populate({ path: 'expediente', select: 'titulo numeroControl abogadoAsignado fechaAudiencia' })
      .lean();

    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.status(200).json(mapEventResponse(evento));
  } catch (error) {
    console.error('Error al obtener evento de agenda:', error);
    res.status(500).json({ message: 'Error al obtener el evento', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.recordatoriosEnviados;

    const {
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      allDay,
      tipo,
      ubicacion,
      expedienteId,
      propietario,
      creadoPor,
      abogadoAsignado,
    } = body;

    if (!titulo || !fechaInicio || !propietario) {
      return res.status(400).json({ message: 'Título, fecha de inicio y propietario son obligatorios' });
    }

    if (!isValidObjectId(propietario)) {
      return res.status(400).json({ message: 'El identificador del propietario no es válido' });
    }

    const inicio = parseDate(fechaInicio);
    const fin = parseDate(fechaFin);

    if (!inicio) {
      return res.status(400).json({ message: 'La fecha de inicio proporcionada no es válida' });
    }

    if (fin && inicio > fin) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

    let expediente = null;
    if (expedienteId) {
      if (!isValidObjectId(expedienteId)) {
        return res.status(400).json({ message: 'El identificador del expediente no es válido' });
      }
      expediente = expedienteId;
    }

    const evento = new AgendaEvent({
      titulo: normalizeText(titulo),
      descripcion: normalizeText(descripcion),
      fechaInicio: inicio,
      fechaFin: fin || null,
      allDay: !!allDay,
      tipo: normalizeTipo(tipo),
      ubicacion: normalizeText(ubicacion),
      expediente,
      propietario,
      creadoPor: creadoPor && isValidObjectId(creadoPor) ? creadoPor : propietario,
      abogadoAsignado: normalizeText(abogadoAsignado),
    });

    const guardado = await evento.save();
    await guardado.populate([
      { path: 'expediente', select: 'titulo numeroControl abogadoAsignado fechaAudiencia' },
      { path: 'propietario', select: 'nombre correo usuario tipo' },
    ]);

    const responseEvent = mapEventResponse(guardado.toObject());

    res.status(201).json({
      message: 'Evento registrado exitosamente',
      evento: responseEvent,
    });

    sendImmediateEventEmail(guardado.propietario, guardado.toObject()).catch((error) =>
      console.error('[agendaRoutes] No se pudo enviar el correo inmediato:', error)
    );
  } catch (error) {
    console.error('Error al crear evento de agenda:', error);
    res.status(500).json({ message: 'Error al crear el evento', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'El identificador del evento no es válido' });
  }

  try {
    const existente = await AgendaEvent.findById(id);

    if (!existente) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const datosBody = { ...req.body };
    delete datosBody.recordatoriosEnviados;

    const {
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      allDay,
      tipo,
      ubicacion,
      expedienteId,
      abogadoAsignado,
    } = datosBody;

    const actualizaciones = {};

    if (typeof titulo === 'string') {
      actualizaciones.titulo = normalizeText(titulo);
    }

    if (descripcion !== undefined) {
      actualizaciones.descripcion = normalizeText(descripcion);
    }

    if (tipo !== undefined) {
      actualizaciones.tipo = normalizeTipo(tipo);
    }

    if (ubicacion !== undefined) {
      actualizaciones.ubicacion = normalizeText(ubicacion);
    }

    if (abogadoAsignado !== undefined) {
      actualizaciones.abogadoAsignado = normalizeText(abogadoAsignado);
    }

    if (typeof allDay === 'boolean') {
      actualizaciones.allDay = allDay;
    }

    let nuevaFechaInicio = existente.fechaInicio;
    let nuevaFechaFin = existente.fechaFin;

    if (fechaInicio !== undefined) {
      const inicio = parseDate(fechaInicio);
      if (!inicio) {
        return res.status(400).json({ message: 'La fecha de inicio proporcionada no es válida' });
      }
      nuevaFechaInicio = inicio;
      actualizaciones.fechaInicio = inicio;
    }

    if (fechaFin !== undefined) {
      if (fechaFin === null || fechaFin === '') {
        nuevaFechaFin = null;
        actualizaciones.fechaFin = null;
      } else {
        const fin = parseDate(fechaFin);
        if (!fin) {
          return res.status(400).json({ message: 'La fecha de fin proporcionada no es válida' });
        }
        nuevaFechaFin = fin;
        actualizaciones.fechaFin = fin;
      }
    }

    if (nuevaFechaFin && nuevaFechaInicio && nuevaFechaFin < nuevaFechaInicio) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

    if (expedienteId !== undefined) {
      if (!expedienteId) {
        actualizaciones.expediente = null;
      } else {
        if (!isValidObjectId(expedienteId)) {
          return res.status(400).json({ message: 'El identificador del expediente no es válido' });
        }
        actualizaciones.expediente = expedienteId;
      }
    }

    const actualizado = await AgendaEvent.findByIdAndUpdate(id, actualizaciones, {
      new: true,
      runValidators: true,
    })
      .populate({ path: 'expediente', select: 'titulo numeroControl abogadoAsignado fechaAudiencia' })
      .lean();

    res.status(200).json({
      message: 'Evento actualizado correctamente',
      evento: mapEventResponse(actualizado),
    });
  } catch (error) {
    console.error('Error al actualizar evento de agenda:', error);
    res.status(500).json({ message: 'Error al actualizar el evento', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'El identificador del evento no es válido' });
  }

  try {
    const eliminado = await AgendaEvent.findByIdAndDelete(id)
      .populate({ path: 'expediente', select: 'titulo numeroControl abogadoAsignado fechaAudiencia' })
      .lean();

    if (!eliminado) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.status(200).json({
      message: 'Evento eliminado correctamente',
      evento: mapEventResponse(eliminado),
    });
  } catch (error) {
    console.error('Error al eliminar evento de agenda:', error);
    res.status(500).json({ message: 'Error al eliminar el evento', error: error.message });
  }
});

module.exports = router;
