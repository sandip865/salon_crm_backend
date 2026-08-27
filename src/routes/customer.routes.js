const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

const customerAuth = [protect, enforceTenantIsolation, checkSubscription];

router.post('/', ...customerAuth, checkPermission('Customer', ['C']), customerController.create);
router.get('/', ...customerAuth, checkPermission('Customer', ['R']), customerController.getAll);
router.get('/:id', ...customerAuth, checkPermission('Customer', ['R']), customerController.getById);
router.put('/:id', ...customerAuth, checkPermission('Customer', ['U']), customerController.update);
router.delete('/:id', ...customerAuth, checkPermission('Customer', ['D']), customerController.remove);

module.exports = router;
