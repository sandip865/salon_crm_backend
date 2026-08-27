const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('../models/role.model');
const User = require('../models/user.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_crm';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

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
      console.log('Created SUPER_ADMIN role');
    } else {
      console.log('SUPER_ADMIN role already exists');
    }

    // 2. Create default super admin user (shubham/shubh)
    let superAdminUser = await User.findOne({ email: 'shubham' });
    if (!superAdminUser) {
      superAdminUser = await User.create({
        email: 'shubham',
        password: 'shubh',
        name: 'Shubham',
        role: superAdminRole._id
      });
      console.log('Created Super Admin user: shubham');
    } else {
      console.log('User shubham already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
