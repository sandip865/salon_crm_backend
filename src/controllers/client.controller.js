const clientService = require('../services/client.service');

exports.createClient = async (req, res) => {
  try {
    const targetSalonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const clientData = { ...req.body, salonId: targetSalonId };
    const client = await clientService.createClient(clientData);
    res.status(201).json({ success: true, message: 'Client created successfully', data: client });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const targetSalonId = req.query.salonId || req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const result = await clientService.getAllClients(req.query, targetSalonId);
    res.json({ success: true, message: 'Clients fetched successfully', data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const targetSalonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const client = await clientService.getClientById(req.params.id, targetSalonId);
    res.json({ success: true, message: 'Client fetched/updated successfully', data: client });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const targetSalonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const client = await clientService.updateClient(req.params.id, req.body, targetSalonId);
    res.json({ success: true, message: 'Client fetched/updated successfully', data: client });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const targetSalonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    await clientService.deleteClient(req.params.id, targetSalonId);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
