const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salon.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

// Salons are generally managed by SUPER_ADMIN, but viewed by SALON_OWNER (their own)
// tenant isolation limits owner to their own salon.
const salonAuth = [protect]; // Removing strict tenant isolation for super admin creating salons

router.post('/', ...salonAuth, checkPermission('Manage Salons', ['C']), salonController.create);
router.get('/', ...salonAuth, checkPermission('Manage Salons', ['R']), salonController.getAll);
router.get('/my-salons', protect, salonController.getMySalons);
router.get('/:id', ...salonAuth, checkPermission('Manage Salons', ['R']), salonController.getById);
router.put('/:id', ...salonAuth, checkPermission('Manage Salons', ['U']), salonController.update);
router.delete('/:id', ...salonAuth, checkPermission('Manage Salons', ['D']), salonController.remove);

module.exports = router;
