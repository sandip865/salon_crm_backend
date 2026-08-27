const Staff = require('../models/staff.model');
const Salon = require('../models/salon.model');

exports.create = async (data, salonId) => {
  // Plan limits check
  const salon = await Salon.findById(salonId).populate('currentPlan');
  if (salon && salon.currentPlan && salon.currentPlan.maxStaff) {
    const currentStaffCount = await Staff.countDocuments({ salonId, isDeleted: false });
    if (currentStaffCount >= salon.currentPlan.maxStaff) {
      const error = new Error(`Plan limit reached: maximum ${salon.currentPlan.maxStaff} staff members allowed.`);
      error.statusCode = 403;
      throw error;
    }
  }

  const existingStaff = await Staff.findOne({
    salonId,
    $or: [{ email: data.email }, { phone: data.phone }]
  });
  if (existingStaff) {
    return { success: false, message: 'A staff member with this email or phone already exists in your salon' };
  }
  const doc = await Staff.create({ ...data, salonId });
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (salonId) => {
  const query = { isDeleted: false, salonId };
  const data = await Staff.find(query);
  return { success: true, message: 'Fetched successfully', data };
};

exports.getById = async (id, salonId) => {
  const query = { _id: id, salonId };
  const doc = await Staff.findOne(query);
  if (!doc) return { success: false, message: 'Staff member not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data, salonId) => {
  const query = { _id: id, salonId };

  if (data.email || data.phone) {
    const $or = [];
    if (data.email) $or.push({ email: data.email });
    if (data.phone) $or.push({ phone: data.phone });
    
    const existing = await Staff.findOne({ salonId, _id: { $ne: id }, $or });
    if (existing) {
      return { success: false, message: 'Another staff member with this email or phone already exists' };
    }
  }

  const doc = await Staff.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!doc) return { success: false, message: 'Staff member not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id, salonId) => {
  const query = { _id: id, salonId };

  const Appointment = require('../models/appointment.model');
  const activeAppt = await Appointment.findOne({
    staff: id,
    isDeleted: false,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });
  if (activeAppt) {
    return { success: false, message: 'Staff member is assigned to active appointments and cannot be deleted.' };
  }

  const doc = await Staff.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Staff member not found' };
  return { success: true, message: 'Success', data: doc };
};
