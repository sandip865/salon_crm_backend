const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

const planAuth = [protect, enforceTenantIsolation]; 

router.post('/', ...planAuth, checkPermission('Manage Plans', ['C']), planController.create);
router.get('/', ...planAuth, checkPermission('Manage Plans', ['R']), planController.getAll);
router.get('/:id', ...planAuth, checkPermission('Manage Plans', ['R']), planController.getById);
router.put('/:id', ...planAuth, checkPermission('Manage Plans', ['U']), planController.update);
router.delete('/:id', ...planAuth, checkPermission('Manage Plans', ['D']), planController.remove);

module.exports = router;
