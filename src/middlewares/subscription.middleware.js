const Salon = require('../models/salon.model');

const checkSubscription = async (req, res, next) => {
  // Super admin skips subscription check
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role?.name === 'SUPER_ADMIN')) {
    return next();
  }

  const salonId = req.user.salonId || req.tenantId;
  if (!salonId) {
    return res.status(403).json({ error: 'NO_SALON', message: 'No salon associated with user.' });
  }

  try {
    const salon = await Salon.findById(salonId).select('subscriptionEndDate subscriptionStatus');
    
    if (!salon) {
      return res.status(404).json({ error: 'SALON_NOT_FOUND' });
    }

    const now = new Date();
    if (salon.subscriptionStatus !== 'ACTIVE' || (salon.subscriptionEndDate && new Date(salon.subscriptionEndDate) < now)) {
      // Auto-update status to expired if date passed but status was still ACTIVE
      if (salon.subscriptionStatus === 'ACTIVE') {
        salon.subscriptionStatus = 'EXPIRED';
        await salon.save();
      }
      return res.status(403).json({ 
        error: 'SUBSCRIPTION_EXPIRED', 
        message: 'Your subscription has expired. Please contact the administrator to renew your plan.' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error checking subscription' });
  }
};

module.exports = { checkSubscription };
