const Customer = require('../models/customer.model');
const { getPagination } = require('../utils/pagination.util');

exports.create = async (data, salonId) => {
  const existingCustomer = await Customer.findOne({
    salonId,
    $or: [{ email: data.email }, { phone: data.phone }]
  });
  if (existingCustomer) {
    return { success: false, message: 'A customer with this email or phone already exists in your salon' };
  }
  const doc = await Customer.create({ ...data, salonId });
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (...args) => {
  let salonId, queryOptions;
  if (args.length >= 2) {
    salonId = args[0];
    queryOptions = args[1] || {};
  } else {
    queryOptions = args[0] || {};
    salonId = queryOptions.salonId;
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

  const data = await Customer.find(query).skip(offset).limit(limit);
  const total = await Customer.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};
exports.getById = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };
  const customer = await Customer.findOne(query);
  if (!customer) return { success: false, message: 'Customer not found' };
  return { success: true, message: 'Success', data: customer };
};

exports.update = async (id, data, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };
  
  if (data.email || data.phone) {
    const $or = [];
    if (data.email) $or.push({ email: data.email });
    if (data.phone) $or.push({ phone: data.phone });
    
    const existing = await Customer.findOne({ salonId, _id: { $ne: id }, $or });
    if (existing) {
      return { success: false, message: 'Another customer with this email or phone already exists' };
    }
  }

  const customer = await Customer.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!customer) return { success: false, message: 'Customer not found' };
  return { success: true, message: 'Success', data: customer };
};

exports.remove = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId } : { _id: id };

  const Appointment = require('../models/appointment.model');
  const activeAppt = await Appointment.findOne({
    customer: id,
    isDeleted: false,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });
  if (activeAppt) {
    return { success: false, message: 'Customer has active appointments and cannot be deleted.' };
  }

  const customer = await Customer.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!customer) return { success: false, message: 'Customer not found' };
  return { success: true, message: 'Success', data: customer };
};
