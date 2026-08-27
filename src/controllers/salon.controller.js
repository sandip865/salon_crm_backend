const salonService = require('../services/salon.service');

exports.create = async (req, res) => {
  try {
    const result = await salonService.create(req.body);
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
    const query = { ...req.query };
    const activeSalonId = req.headers['x-salon-id'];
    if (activeSalonId) {
      query._id = activeSalonId;
    }
    const result = await salonService.getAll(query);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};

exports.getMySalons = async (req, res) => {
  try {
    const result = await salonService.getMySalons(req.user);
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
    const result = await salonService.getById(id);
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
    const result = await salonService.update(id, req.body);
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
    const result = await salonService.remove(id);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, error: 'Server error' });
  }
};
