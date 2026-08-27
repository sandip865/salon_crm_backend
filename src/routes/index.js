const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const appointmentRoutes = require('./appointment.routes');
const planRoutes = require('./plan.routes');
const attendanceRoutes = require('./attendance.routes');
const userRoutes = require('./user.routes');
const salonRoutes = require('./salon.routes');
const customerRoutes = require('./customer.routes');
const serviceRoutes = require('./service.routes');
const roleRoutes = require('./role.routes');
const subscriptionHistoryRoutes = require('./subscription_history.routes');
const clientRoutes = require('./client.routes');
const dashboardRoutes = require('./dashboard.routes');

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/plans', planRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/salons', salonRoutes);
router.use('/customers', customerRoutes);
router.use('/services', serviceRoutes);
router.use('/subscription-history', subscriptionHistoryRoutes);
router.use('/clients', clientRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
