const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  salonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: false // some plans might be global
  },
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true },
  maxStaff: { type: Number, required: true },
  maxAppointments: { type: Number, required: true }
,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
