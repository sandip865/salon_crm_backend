const serviceService = require('../services/service.service');

exports.create = async (req, res) => {
  try {
    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId : null);
    if (!salonId) {
      return res.status(400).send({ success: false, message: "salonId is required" });
    }
    const result = await serviceService.create(req.body, salonId);
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
    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId : null);
    if (!salonId) {
      return res.status(400).send({ success: false, message: "salonId is required" });
    }
    const result = await serviceService.getAll(salonId, req.query);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await serviceService.getById(id, salonId);
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
    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await serviceService.update(id, req.body, salonId);
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
    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.query.clientId || (req.user?.role?.name === "SUPER_ADMIN" ? req.body?.salonId : null);
    if (!id || !salonId) {
      return res.status(400).send({ success: false, message: "id and salonId are required" });
    }
    const result = await serviceService.remove(id, salonId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};
