const mongoose = require('mongoose');

const rolesPermitidos = ['ADMINISTRADOR', 'ABOGADO', 'PRACTICANTE', 'BECARIO'];

const userSchema = new mongoose.Schema(
  {
    usuario: { type: String, required: true, trim: true, unique: true },
    correo: { type: String, required: true, trim: true, lowercase: true, unique: true },
    contrasena: { type: String, required: true, minlength: 6 },
    tipo: {
      type: String,
      required: true,
      enum: rolesPermitidos,
      uppercase: true,
      trim: true,
    },
    nombre: { type: String, required: true, trim: true },
    activo: { type: Boolean, default: true },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

userSchema.index({ usuario: 1 }, { unique: true });
userSchema.index({ correo: 1 }, { unique: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  rolesPermitidos,
};
