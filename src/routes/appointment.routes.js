const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

const appointmentAuth = [protect, enforceTenantIsolation, checkSubscription];

// Inject checkPermission inline for each route
router.post('/', ...appointmentAuth, checkPermission('Appointment', ['C']), appointmentController.create);
router.get('/', ...appointmentAuth, checkPermission('Appointment', ['R']), appointmentController.getAll);
router.get('/:id', ...appointmentAuth, checkPermission('Appointment', ['R']), appointmentController.getById);
router.put('/:id', ...appointmentAuth, checkPermission('Appointment', ['U']), appointmentController.update);
router.delete('/:id', ...appointmentAuth, checkPermission('Appointment', ['D']), appointmentController.remove);

module.exports = router;
