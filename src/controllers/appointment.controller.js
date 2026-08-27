const appointmentService = require('../services/appointment.service');

exports.create = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN';
    const salonId = req.user.salonId || (isSuperAdmin ? (req.body.salonId || req.body.clientId) : null);
    
    if (!salonId) return res.status(403).json({ success: false, message: 'Forbidden: No salon associated' });
    
    const result = await appointmentService.create(req.body, salonId);
    if (!result.success) return res.status(400).json(result);
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const salonId = req.user.salonId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN';
    
    if (!salonId && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: No salon associated' });
    }
    
    // Pass null if super admin, service needs to handle this
    const result = await appointmentService.getAll(isSuperAdmin ? null : salonId, req.query);
    if (!result.success) return res.status(400).json(result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const salonId = req.user.salonId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN';
    if (!salonId && !isSuperAdmin) return res.status(403).json({ success: false, message: 'Forbidden: No salon associated' });
    
    const result = await appointmentService.getById(req.params.id, isSuperAdmin ? null : salonId);
    if (!result.success) return res.status(404).json(result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const salonId = req.user.salonId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN';
    if (!salonId && !isSuperAdmin) return res.status(403).json({ success: false, message: 'Forbidden: No salon associated' });
    
    const result = await appointmentService.update(req.params.id, req.body, isSuperAdmin ? null : salonId);
    if (!result.success) return res.status(404).json(result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const salonId = req.user.salonId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN';
    if (!salonId && !isSuperAdmin) return res.status(403).json({ success: false, message: 'Forbidden: No salon associated' });
    
    const result = await appointmentService.remove(req.params.id, isSuperAdmin ? null : salonId);
    if (!result.success) return res.status(400).json(result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
