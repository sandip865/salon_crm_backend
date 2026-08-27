const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm';

app.use(cors());
app.use(express.json());

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// Debug route to check env
app.get('/api/debug', (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) : null,
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/api/seed', async (req, res) => {
  try {
    const Role = require('./models/role.model');
    const User = require('./models/user.model');
    
    // 1. Create Super Admin Role with full permissions
    let superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'SUPER_ADMIN',
        permissions: [
          { resource: 'Dashboard', actions: ['R'] },
          { resource: 'Manage Plans', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Manage Salons', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Subscription History', actions: ['R'] },
          { resource: 'User Management', actions: ['C', 'R', 'U', 'D'] },
        ]
      });
    }

    // 2. Create default super admin user (admin@saloncrm.com / Admin@123)
    let superAdminUser = await User.findOne({ email: 'admin@saloncrm.com' });
    if (!superAdminUser) {
      superAdminUser = await User.create({
        email: 'admin@saloncrm.com',
        password: 'Admin@123',
        name: 'Super Admin',
        role: superAdminRole._id
      });
    }

    res.json({ success: true, message: 'Database seeded successfully', email: 'admin@saloncrm.com' });
  } catch (error) {
    res.status(500).json({ error: 'Seed failed', details: error.message });
  }
});

app.use('/api', routes);

// Centralized error handling
app.use(errorHandler);

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const id = ret._id;
    delete ret._id;
    delete ret.__v;
    return { id, ...ret };
  }
});

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
      return res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Salon CRM API Running');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
