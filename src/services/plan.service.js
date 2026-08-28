const Plan = require('../models/plan.model');
const { getPagination } = require('../utils/pagination.util');
const mongoose = require('mongoose');

exports.create = async (data) => {
  const existingPlan = await Plan.findOne({ name: data.name, isDeleted: false });
  if (existingPlan) {
    return { success: false, message: 'A plan with this name already exists' };
  }
  const doc = await Plan.create(data);
  return { success: true, message: 'Created successfully', data: doc };
};

exports.getAll = async (queryOptions = {}) => {
  const { page, limit, offset } = getPagination(queryOptions);
  
  const query = { isDeleted: false, ...queryOptions };

  if (query.k) {
    query.$or = [
      { name: { $regex: query.k, $options: 'i' } }
    ];
    delete query.k;
  }

  const data = await Plan.find(query).skip(offset).limit(limit);
  const total = await Plan.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};

exports.getById = async (id) => {
  const query = { _id: id };
  const doc = await Plan.findOne(query);
  if (!doc) return { success: false, message: 'Plan not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data) => {
  const query = { _id: id };

  if (data.name) {
    const existingPlan = await Plan.findOne({ name: data.name, _id: { $ne: new mongoose.Types.ObjectId(id) }, isDeleted: false });
    if (existingPlan) {
      return { success: false, message: 'Another plan with this name already exists' };
    }
  }

  const doc = await Plan.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!doc) return { success: false, message: 'Plan not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id) => {
  const query = { _id: id };
  const doc = await Plan.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Plan not found' };
  return { success: true, message: 'Success', data: doc };
};
