const express = require('express');
const router = express.Router();
const subscriptionHistoryController = require('../controllers/subscription_history.controller');
const { protect } = require('../middlewares/auth.middleware');

const { checkPermission } = require('../middlewares/rbac.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const subAuth = [protect, enforceTenantIsolation];

router.post('/', ...subAuth, checkPermission('Subscription History', ['C']), subscriptionHistoryController.create);
router.get('/', ...subAuth, checkPermission('Subscription History', ['R']), subscriptionHistoryController.getAll);
router.get('/:id', ...subAuth, checkPermission('Subscription History', ['R']), subscriptionHistoryController.getById);
router.put('/:id', ...subAuth, checkPermission('Subscription History', ['U']), subscriptionHistoryController.update);
router.delete('/:id', ...subAuth, checkPermission('Subscription History', ['D']), subscriptionHistoryController.delete);

module.exports = router;
