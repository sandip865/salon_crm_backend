const customerService = require('../services/customer.service');

exports.create = async (req, res) => {
  try {
    const salonId = req.user?.salonId || req.headers['x-salon-id'] || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId || req.query.salonId : null);
    if (!salonId) {
      return res.status(400).send({ success: false, message: "salonId is required" });
    }
    const result = await customerService.create(req.body, salonId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const salonId = req.user?.salonId || req.headers['x-salon-id'] || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId || req.query.salonId : null);
    if (!salonId) {
      return res.status(400).send({ success: false, message: "salonId is required" });
    }
    const result = await customerService.getAll(salonId, req.query);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const salonId = req.user?.salonId || req.headers['x-salon-id'] || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId || req.query.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await customerService.getById(id, salonId);
    if (!result.success) {
      return res.status(404).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const salonId = req.user?.salonId || req.headers['x-salon-id'] || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId || req.query.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await customerService.update(id, req.body, salonId);
    if (!result.success) {
      return res.status(404).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const salonId = req.user?.salonId || req.headers['x-salon-id'] || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId || req.query.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await customerService.remove(id, salonId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};
