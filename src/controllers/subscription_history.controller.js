const subscriptionHistoryService = require('../services/subscription_history.service');

exports.create = async (req, res, next) => {
  try {
    const result = await subscriptionHistoryService.create(req.body, req.user.salonId);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await subscriptionHistoryService.getAll(req.user.salonId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await subscriptionHistoryService.getById(req.params.id, req.user.salonId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await subscriptionHistoryService.update(req.params.id, req.body, req.user.salonId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await subscriptionHistoryService.delete(req.params.id, req.user.salonId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};
