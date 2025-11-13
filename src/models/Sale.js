const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El cliente es requerido']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'La descripción no puede tener más de 300 caracteres']
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for queries and reports
saleSchema.index({ date: -1 });
saleSchema.index({ client: 1 });
saleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', saleSchema);
