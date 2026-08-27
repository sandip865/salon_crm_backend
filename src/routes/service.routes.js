const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

const serviceAuth = [protect, enforceTenantIsolation, checkSubscription];

router.post('/', ...serviceAuth, checkPermission('Service', ['C']), serviceController.create);
router.get('/', ...serviceAuth, checkPermission('Service', ['R']), serviceController.getAll);
router.get('/:id', ...serviceAuth, checkPermission('Service', ['R']), serviceController.getById);
router.put('/:id', ...serviceAuth, checkPermission('Service', ['U']), serviceController.update);
router.delete('/:id', ...serviceAuth, checkPermission('Service', ['D']), serviceController.remove);

module.exports = router;
