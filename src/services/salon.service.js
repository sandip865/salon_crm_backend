const Salon = require('../models/salon.model');
const Plan = require('../models/plan.model');
const SubscriptionHistory = require('../models/subscription_history.model');
const { getPagination } = require('../utils/pagination.util');

exports.create = async (data) => {
  const existingSalon = await Salon.findOne({ name: data.name });
  if (existingSalon) {
    return { success: false, message: 'A salon with this name already exists' };
  }
  const doc = await Salon.create(data);
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

  const data = await Salon.find(query).populate('currentPlan').skip(offset).limit(limit);
  const total = await Salon.countDocuments(query);

  return { 
    success: true, 
    message: 'Fetched successfully', 
    data, 
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
  };
};

exports.getMySalons = async (user) => {
  if (user.role.name === 'SUPER_ADMIN') {
    const data = await Salon.find({ isDeleted: false });
    return { success: true, data };
  } else {
    if (!user.salonId) {
      return { success: true, data: [] };
    }
    const salon = await Salon.findById(user.salonId);
    return { success: true, data: salon && !salon.isDeleted ? [salon] : [] };
  }
};

exports.getById = async (id) => {
  const query = { _id: id };
  const doc = await Salon.findOne(query).populate('currentPlan');
  if (!doc) return { success: false, message: 'Salon not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.update = async (id, data) => {
  const query = { _id: id };

  if (data.name) {
    const existingSalon = await Salon.findOne({ name: data.name, _id: { $ne: id } });
    if (existingSalon) {
      return { success: false, message: 'Another salon with this name already exists' };
    }
  }

  // Handle plan assignment/renewal/upgrade
  if (data.currentPlan) {
    const salon = await Salon.findById(id);
    if (salon) {
      const plan = await Plan.findById(data.currentPlan);
      if (plan) {
        let action = 'ASSIGN';
        if (salon.currentPlan) {
          if (salon.currentPlan.toString() === data.currentPlan.toString()) {
            action = 'RENEW';
          } else {
            action = 'UPGRADE'; // Or downgrade, but we use UPGRADE for any change
          }
        }
        
        // Ensure start/end dates are available
        const startDate = data.subscriptionStartDate || new Date();
        const endDate = data.subscriptionEndDate || new Date(startDate.getTime() + (plan.durationInDays || 30) * 24 * 60 * 60 * 1000);

        await SubscriptionHistory.create({
          salonId: id,
          planId: plan._id,
          startDate,
          endDate,
          price: plan.price,
          action
        });
      }
    }
  }

  const doc = await Salon.findOneAndUpdate(query, data, { new: true, runValidators: true });
  if (!doc) return { success: false, message: 'Salon not found' };
  return { success: true, message: 'Success', data: doc };
};

exports.remove = async (id) => {
  const query = { _id: id };
  const doc = await Salon.findOneAndUpdate(query, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!doc) return { success: false, message: 'Salon not found' };
  return { success: true, message: 'Success', data: doc };
};
