const Attendance = require('../models/attendance.model');
const Salon = require('../models/salon.model');

// Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
};

exports.create = async (data, salonId, staff) => {
  const { latitude, longitude } = data;
  if (latitude == null || longitude == null) {
    const error = new Error('Coordinates missing');
    error.statusCode = 400;
    throw error;
  }

  const salon = await Salon.findById(salonId);
  if (!salon) {
    const error = new Error('Salon not found');
    error.statusCode = 404;
    throw error;
  }

  const distance = getDistance(latitude, longitude, salon.latitude, salon.longitude);

  if (distance > salon.allowedRadius) {
    const error = new Error('OUT_OF_RANGE');
    error.statusCode = 403;
    throw error;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existingRecord = await Attendance.findOne({
    salonId,
    staff,
    checkOutTime: { $exists: false },
    checkInTime: { $gte: startOfDay }
  });

  if (existingRecord) {
    const error = new Error('You are already checked in. Please check out first.');
    error.statusCode = 400;
    throw error;
  }

  const doc = await Attendance.create({
    salonId,
    staff,
    checkInTime: new Date(),
    latitude, 
    longitude,
    distance
  });

  return { success: true, message: 'Checked in successfully', data: doc };
};

exports.getAll = async (salonId, staff, queryOptions = {}) => {
  const { getPagination } = require('../utils/pagination.util');
  const { page, limit, offset } = getPagination(queryOptions);

  const query = { salonId, isDeleted: false };
  if (staff) query.staff = staff;

  if (queryOptions.date) {
    const startOfDay = new Date(queryOptions.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryOptions.date);
    endOfDay.setHours(23, 59, 59, 999);
    query.checkInTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const data = await Attendance.find(query).sort({ checkInTime: -1 }).skip(offset).limit(limit).populate('staff', 'name email');
  const total = await Attendance.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

exports.getById = async (id, salonId) => {
  const query = { _id: id, salonId };
  const doc = await Attendance.findOne(query).populate('staff', 'name email');
  if (!doc) return { success: false, message: 'Attendance record not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.checkOut = async (salonId, staff) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const records = await Attendance.find({
    salonId,
    staff,
    checkOutTime: { $exists: false },
    checkInTime: { $gte: startOfDay }
  });

  if (!records || records.length === 0) {
    const error = new Error('No active check-in found for today');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  for (let record of records) {
    record.checkOutTime = now;
    await record.save();
  }

  return { success: true, message: 'Checked out successfully', data: records[0] };
};
