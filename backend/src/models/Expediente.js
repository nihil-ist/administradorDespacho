const mongoose = require('mongoose');

const estadosExpediente = ['EXHORTO', 'EN_PROCESO', 'TERMINADO', 'ARCHIVADO'];

const archivoSchema = new mongoose.Schema(
  {
    nombreOriginal: { type: String, required: true },
    url: { type: String, required: true },
    storagePath: { type: String, required: true },
    contentType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const expedienteSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    numeroControl: { type: String, required: true, trim: true, unique: true },
    cliente: { type: String, required: true, trim: true },
    abogadoAsignado: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true },
    estatus: { type: String, enum: estadosExpediente, default: 'EN_PROCESO' },
    fechaApertura: { type: Date, required: true },
    fechaAudiencia: { type: Date },
    fechaConclusion: { type: Date },
    descripcion: { type: String, trim: true },
    notasInternas: { type: String, trim: true },
    etiquetas: [{ type: String, trim: true }],
    archivos: [archivoSchema],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'expedientes',
    timestamps: true,
  }
);

expedienteSchema.index({ numeroControl: 1 }, { unique: true });
expedienteSchema.index({ cliente: 'text', titulo: 'text', abogadoAsignado: 'text' });

module.exports = {
  Expediente: mongoose.model('Expediente', expedienteSchema),
  estadosExpediente,
};
