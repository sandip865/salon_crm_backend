const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  allowedRadius: { type: Number, required: true }, // in meters
  
  // Subscription info
  currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  subscriptionStatus: { 
    type: String, 
    enum: ['ACTIVE', 'EXPIRED', 'INACTIVE'],
    default: 'INACTIVE'
  }
,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Salon', salonSchema);
