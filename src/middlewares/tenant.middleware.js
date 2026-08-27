const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  
  // Super Admins don't have a salonId attached to them usually, but they might specify it in params/body
  if (req.user.role?.name === 'SUPER_ADMIN') {
    const requestedSalonId = req.headers['x-salon-id'];
    if (requestedSalonId) {
      req.user.salonId = requestedSalonId;
      req.tenantId = requestedSalonId;
    }
    return next();
  }

  const requestedSalonId = req.headers['x-salon-id'];
  if (requestedSalonId) {
     let authorized = false;
     if (req.user.salonId && req.user.salonId.toString() === requestedSalonId) authorized = true;
     if (req.user.salons && req.user.salons.some(s => (s._id || s).toString() === requestedSalonId)) authorized = true;
     
     if (authorized) {
       req.user.salonId = requestedSalonId;
     } else {
       return res.status(403).json({ error: 'Forbidden: Access to this salon is denied' });
     }
  }

  if (!req.user.salonId && (!req.user.salons || req.user.salons.length === 0)) {
    return res.status(400).json({ error: 'NO_SALON_ASSIGNED' });
  }

  if (!req.user.salonId && req.user.salons && req.user.salons.length > 0) {
    req.user.salonId = req.user.salons[0]._id || req.user.salons[0];
  }

  req.tenantId = req.user.salonId;
  next();
};

module.exports = { enforceTenantIsolation };
