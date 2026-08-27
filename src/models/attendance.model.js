const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  distance: { type: Number, required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ staff: 1, checkInTime: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
