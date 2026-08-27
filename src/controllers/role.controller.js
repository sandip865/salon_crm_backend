const Role = require('../models/role.model');

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name || !permissions) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }
    
    // Assign to their salonId logic
    let salonId;
    if (req.body.hasOwnProperty('salonId')) {
      salonId = req.body.salonId;
    } else {
      salonId = req.headers['x-salon-id'] || req.user?.salonId || req.query.salonId || req.tenantId || null;
    }
    const role = await Role.create({ name, permissions, salonId });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const query = { isDeleted: false, name: { $ne: 'SUPER_ADMIN' } };
    const requesterRole = req.user?.role?.name;
    
    if (requesterRole !== 'SUPER_ADMIN' && requesterRole !== 'SALON_OWNER') {
      query.name = { $nin: ['SUPER_ADMIN', 'SALON_OWNER'] };
    }

    const salonId = req.query.salonId || req.headers['x-salon-id'] || req.user?.salonId || req.body?.salonId || req.tenantId;
    
    if (salonId) {
      // Salon owner or SuperAdmin specifying a salon: see global roles + salon roles
      query.$or = [{ salonId: salonId }, { salonId: { $exists: false } }, { salonId: null }];
    } else if (req.user?.role?.name !== "SUPER_ADMIN") {
      // Fallback for non-super admin without salonId (shouldn't happen, but just in case)
      query.$or = [{ salonId: { $exists: false } }, { salonId: null }];
    }
    // If SUPER_ADMIN and no salonId, query remains empty so it fetches ALL roles (except SUPER_ADMIN).
    
    const { getPagination } = require('../utils/pagination.util');
    const { page, limit, offset } = getPagination(req.query);

    const roles = await Role.find(query).skip(offset).limit(limit);
    const total = await Role.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: roles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    // Prevent editing global roles if not SUPER_ADMIN
    if (!role.salonId && req.user.role?.name !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot modify global roles' });
    }

    Object.assign(role, req.body);
    await role.save();
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    // Prevent deleting global roles if not SUPER_ADMIN
    if (!role.salonId && req.user.role?.name !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete global roles' });
    }

    role.isDeleted = true;
    await role.save();
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
