const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  name: { type: String, required: true }, // e.g., 'Haircut', 'Facial'
  durationInMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

serviceSchema.index({ salonId: 1 });

module.exports = mongoose.model('Service', serviceSchema);
