const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');

router.get('/', protect, enforceTenantIsolation, restrictTo('SUPER_ADMIN', 'SALON_OWNER', 'RECEPTIONIST'), dashboardController.getStats);

module.exports = router;
