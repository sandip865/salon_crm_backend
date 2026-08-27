const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { 
    type: String, 
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  companyName: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

clientSchema.index({ salonId: 1, email: 1 }, { unique: true });
clientSchema.index({ salonId: 1, phone: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Client', clientSchema);
