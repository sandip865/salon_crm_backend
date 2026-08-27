const Appointment = require('../models/appointment.model');
const Service = require('../models/service.model');
const Client = require('../models/client.model');
const User = require('../models/user.model');
const Salon = require('../models/salon.model');

exports.create = async (data, salonId) => {
  const { client, service, staff, date, startTime, status } = data;

  // Tenant validation
  const clientExists = await Client.findOne({ _id: client, salonId });
  if (!clientExists) return { success: false, message: 'Client not found or does not belong to this salon' };
  
  // A staff member is actually a User linked to this salon
  const staffExists = await User.findOne({ 
    _id: staff, 
    $or: [{ salonId }, { salons: salonId }] 
  });
  if (!staffExists) return { success: false, message: 'Staff/User not found or does not belong to this salon' };

  const svc = await Service.findOne({ _id: service, salonId });
  if (!svc) return { success: false, message: 'Service not found or does not belong to this salon' };

  // Working Hours & Duration calculation
  const [startH, startM] = startTime.split(':').map(Number);
  let endM = startM + svc.durationInMinutes;
  let endH = startH + Math.floor(endM / 60);
  endM = endM % 60;
  
  if (startH < 9 || endH > 20 || (endH === 20 && endM > 0)) {
    return { success: false, message: 'Appointment must be completely within working hours (09:00 to 20:00)' };
  }

  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

  // Overlap conflict detection
  const conflictingAppt = await Appointment.findOne({
    salonId,
    staff,
    date,
    status: { $ne: 'CANCELLED' }, // Only CANCELLED is ignored
    isDeleted: false,
    $and: [
      { startTime: { $lt: endTime } },
      { endTime: { $gt: startTime } }
    ]
  });

  if (conflictingAppt) {
    const error = new Error('Staff conflict: Staff is already booked during this time');
    error.statusCode = 409;
    throw error;
  }

  // Plan Limits
  const salon = await Salon.findById(salonId).populate('currentPlan');
  if (salon && salon.currentPlan && salon.currentPlan.maxAppointments) {
    const count = await Appointment.countDocuments({
      salonId,
      createdAt: { 
        $gte: salon.subscriptionStartDate,
        $lte: salon.subscriptionEndDate || new Date()
      },
      isDeleted: false
    });
    
    if (count >= salon.currentPlan.maxAppointments) {
      return { success: false, message: `Plan limit reached: maximum ${salon.currentPlan.maxAppointments} appointments allowed per billing period.` };
    }
  }

  const doc = await Appointment.create({
    salonId,
    client,
    service,
    staff,
    date,
    startTime,
    endTime,
    status: status || 'PENDING'
  });
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (salonId, queryOptions = {}) => {
  const query = { isDeleted: false };
  if (salonId) {
    query.salonId = salonId;
  }
  const docs = await Appointment.find(query)
    .populate('client', 'name')
    .populate('staff', 'name')
    .populate('service', 'name price')
    .sort({ date: 1, startTime: 1 });
  
  return { success: true, message: 'Fetched successfully', data: docs };
};

exports.getById = async (id, salonId) => {
  const query = { _id: id, isDeleted: false };
  if (salonId) query.salonId = salonId;
  const doc = await Appointment.findOne(query)
    .populate('client', 'name')
    .populate('staff', 'name')
    .populate('service', 'name price');
  if (!doc) return { success: false, message: 'Appointment not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data, salonId) => {
  const query = { _id: id, isDeleted: false };
  if (salonId) query.salonId = salonId;
  const doc = await Appointment.findOneAndUpdate(query, data, { new: true });
  if (!doc) return { success: false, message: 'Appointment not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id, salonId) => {
  const query = { _id: id, isDeleted: false };
  if (salonId) query.salonId = salonId;
  const doc = await Appointment.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Appointment not found' };
  return { success: true, message: 'Success', data: doc };
};
