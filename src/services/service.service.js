const Service = require('../models/service.model');
const { getPagination } = require('../utils/pagination.util');

exports.create = async (data, salonId) => {
  const existingService = await Service.findOne({ name: data.name, salonId });
  if (existingService) {
    return { success: false, message: 'A service with this name already exists in your salon' };
  }
  const doc = await Service.create({ ...data, salonId });
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (...args) => {
  let salonId, queryOptions;
  if (args.length >= 2) {
    salonId = args[0];
    queryOptions = args[1] || {};
  } else {
    queryOptions = args[0] || {};
    salonId = queryOptions.clientId || queryOptions.salonId;
  }
  
  const { page, limit, offset } = getPagination(queryOptions);
  
  const query = { isDeleted: false, ...queryOptions };
  if (salonId && typeof salonId === 'string') query.salonId = salonId;

  if (query.k) {
    query.$or = [
      { name: { $regex: query.k, $options: 'i' } },
      { email: { $regex: query.k, $options: 'i' } },
      { title: { $regex: query.k, $options: 'i' } }
    ];
    delete query.k;
  }
  delete query.clientId; // clean up if passed by mistake

  const data = await Service.find(query).skip(offset).limit(limit);
  const total = await Service.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};

exports.getById = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };
  const doc = await Service.findOne(query);
  if (!doc) return { success: false, message: 'Service not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };
  
  if (data.name) {
    const existing = await Service.findOne({ name: data.name, salonId, _id: { $ne: id } });
    if (existing) {
      return { success: false, message: 'Another service with this name already exists in your salon' };
    }
  }

  const doc = await Service.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!doc) return { success: false, message: 'Service not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };
  
  // Integrity check: Can't delete if used in active appointments
  const Appointment = require('../models/appointment.model');
  const activeAppt = await Appointment.findOne({
    service: id,
    isDeleted: false,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });
  if (activeAppt) {
    return { success: false, message: 'Service is booked in active appointments and cannot be deleted.' };
  }

  const doc = await Service.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Service not found' };
  return { success: true, message: 'Success', data: doc };
};
