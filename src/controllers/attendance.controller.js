const attendanceService = require('../services/attendance.service');

exports.create = async (req, res, next) => {
  try {
    const salonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const staff = req.user._id;

    if (!salonId) {
      const error = new Error('salonId is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await attendanceService.create(req.body, salonId, staff);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const salonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    if (!salonId) {
      const error = new Error('salonId is required');
      error.statusCode = 400;
      throw error;
    }
    const staff = req.user._id;
    const result = await attendanceService.getAll(salonId, staff, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    if (!id || !salonId) {
      const error = new Error('id and salonId are required');
      error.statusCode = 400;
      throw error;
    }
    const result = await attendanceService.getById(id, salonId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const salonId = req.headers['x-salon-id'] || req.user.salonId || req.tenantId;
    const staff = req.user._id;

    if (!salonId) {
      const error = new Error('salonId is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await attendanceService.checkOut(salonId, staff);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
