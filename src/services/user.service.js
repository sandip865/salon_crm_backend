const User = require('../models/user.model');
const { getPagination } = require('../utils/pagination.util');

exports.create = async (data, clientId) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    return { success: false, message: 'A user with this email already exists' };
  }
  const doc = await User.create({ ...data, clientId });
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (...args) => {
  let clientId, queryOptions;
  if (args.length >= 2) {
    clientId = args[0];
    queryOptions = args[1] || {};
  } else {
    queryOptions = args[0] || {};
    clientId = queryOptions.clientId;
  }
  
  const { page, limit, offset } = getPagination(queryOptions);
  
  const query = { isDeleted: false, ...queryOptions };
  if (clientId && typeof clientId === 'string') query.clientId = clientId;

  if (query.k) {
    query.$or = [
      { name: { $regex: query.k, $options: 'i' } },
      { email: { $regex: query.k, $options: 'i' } },
      { title: { $regex: query.k, $options: 'i' } }
    ];
    delete query.k;
  }

  const data = await User.find(query).skip(offset).limit(limit);
  const total = await User.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};


exports.getById = async (id, clientId) => {
  const query = clientId ? { _id: id, clientId } : { _id: id };
  const doc = await User.findOne(query);
  if (!doc) return { success: false, message: 'User not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data, clientId) => {
  const query = clientId ? { _id: id, clientId } : { _id: id };
  
  if (data.email) {
    const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (existingUser) {
      return { success: false, message: 'Another user with this email already exists' };
    }
  }

  const doc = await User.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!doc) return { success: false, message: 'User not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id, clientId) => {
  const query = clientId ? { _id: id, clientId } : { _id: id };
  const doc = await User.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'User not found' };
  return { success: true, message: 'Success', data: doc };
};
