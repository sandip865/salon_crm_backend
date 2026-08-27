const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { enforceTenantIsolation } = require('../middlewares/tenant.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

const attendanceAuth = [protect, enforceTenantIsolation, checkSubscription];

router.post('/check-in', ...attendanceAuth, checkPermission('Attendance', ['C']), attendanceController.create);
router.get('/', ...attendanceAuth, checkPermission('Attendance', ['R']), attendanceController.getAll);
router.get('/:id', ...attendanceAuth, checkPermission('Attendance', ['R']), attendanceController.getById);
router.put('/check-out', ...attendanceAuth, checkPermission('Attendance', ['U']), attendanceController.checkOut);


module.exports = router;
