const Client = require('../models/client.model');
const { getPagination } = require('../utils/pagination.util');

exports.createClient = async (clientData) => {
  const filter = { email: clientData.email, isDeleted: false };
  if (clientData.salonId) filter.salonId = clientData.salonId;
  const existing = await Client.findOne(filter);
  if (existing) {
    throw new Error('Client with this email already exists');
  }
  return await Client.create(clientData);
};

exports.getAllClients = async (query, salonId) => {
  const { page, limit, offset: skip } = getPagination(query);
  
  const filter = { isDeleted: false };
  if (salonId) filter.salonId = salonId;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { companyName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }

  const clients = await Client.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Client.countDocuments(filter);

  return {
    clients,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

exports.getClientById = async (id, salonId) => {
  const filter = { _id: id, isDeleted: false };
  if (salonId) filter.salonId = salonId;
  const client = await Client.findOne(filter);
  if (!client) throw new Error('Client not found');
  return client;
};

exports.updateClient = async (id, updateData, salonId) => {
  const filter = { _id: id, isDeleted: false };
  if (salonId) filter.salonId = salonId;
  const client = await Client.findOneAndUpdate(
    filter,
    updateData,
    { new: true, runValidators: true }
  );
  if (!client) throw new Error('Client not found');
  return client;
};

exports.deleteClient = async (id, salonId) => {
  const filter = { _id: id, isDeleted: false };
  if (salonId) filter.salonId = salonId;
  const client = await Client.findOneAndUpdate(
    filter,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!client) throw new Error('Client not found');
  return client;
};
