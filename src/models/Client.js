const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede tener más de 150 caracteres']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede tener más de 20 caracteres']
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'La industria no puede tener más de 100 caracteres']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
clientSchema.index({ name: 'text', email: 'text', industry: 'text' });

module.exports = mongoose.model('Client', clientSchema);
