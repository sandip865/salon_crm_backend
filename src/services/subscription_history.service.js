const SubscriptionHistory = require('../models/subscription_history.model');
const { getPagination } = require('../utils/pagination.util');

exports.create = async (data, salonId) => {
  const doc = await SubscriptionHistory.create({ ...data, salonId });
  return { success: true, message: 'Subscription history created successfully', data: doc };
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

  const data = await SubscriptionHistory.find(query).populate('planId').populate('salonId').skip(offset).limit(limit).sort({ createdAt: -1 });
  const total = await SubscriptionHistory.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};

exports.getById = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId, isDeleted: false } : { _id: id, isDeleted: false };
  const doc = await SubscriptionHistory.findOne(query).populate('planId').populate('salonId');
  if (!doc) return { success: false, message: 'Subscription history not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data, salonId) => {
  const query = salonId ? { _id: id, salonId, isDeleted: false } : { _id: id, isDeleted: false };
  const doc = await SubscriptionHistory.findOneAndUpdate(query, data, { new: true });
  if (!doc) return { success: false, message: 'Subscription history not found' };
  return { success: true, message: 'Updated successfully', data: doc };
};

exports.delete = async (id, salonId) => {
  const query = salonId ? { _id: id, salonId, isDeleted: false } : { _id: id, isDeleted: false };
  const doc = await SubscriptionHistory.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Subscription history not found' };
  return { success: true, message: 'Deleted successfully' };
};
