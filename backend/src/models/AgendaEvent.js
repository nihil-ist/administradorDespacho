const mongoose = require('mongoose');

const tiposEventoAgenda = ['AUDIENCIA', 'CITA', 'REUNION', 'TAREA', 'OTRO'];

const agendaEventSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    allDay: { type: Boolean, default: false },
    tipo: {
      type: String,
      enum: tiposEventoAgenda,
      default: 'OTRO',
    },
    ubicacion: { type: String, trim: true },
    expediente: { type: mongoose.Schema.Types.ObjectId, ref: 'Expediente' },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    abogadoAsignado: { type: String, trim: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'agendaEventos',
    timestamps: true,
  }
);

agendaEventSchema.index({ propietario: 1, fechaInicio: 1 });
agendaEventSchema.index({ fechaInicio: 1 });
agendaEventSchema.index({ tipo: 1 });
agendaEventSchema.add({
  recordatoriosEnviados: {
    type: [String],
    enum: ['24H', '6H', '1H', '15M'],
    default: [],
  },
});
agendaEventSchema.index({ recordatoriosEnviados: 1 });

module.exports = {
  AgendaEvent: mongoose.model('AgendaEvent', agendaEventSchema),
  tiposEventoAgenda,
};
