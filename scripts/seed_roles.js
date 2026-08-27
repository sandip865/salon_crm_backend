const mongoose = require('mongoose');
const Role = require('../src/models/role.model');

// Make sure to set your MONGO_URI in .env or run with MONGO_URI=...
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_crm';

const defaultRoles = [
  {
    name: 'SUPER_ADMIN',
    permissions: [
      { resource: 'Plan', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'Salon', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'User', actions: ['C', 'R', 'U', 'D'] },
    ]
  },
  {
    name: 'SALON_OWNER',
    permissions: [
      { resource: 'Appointment', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'Attendance', actions: ['R'] },
      { resource: 'Client', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'Salon', actions: ['R', 'U'] },
      { resource: 'Service', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'Staff', actions: ['C', 'R', 'U', 'D'] },
      { resource: 'User', actions: ['R'] }
    ]
  },
  {
    name: 'RECEPTIONIST',
    permissions: [
      { resource: 'Appointment', actions: ['C', 'R', 'U'] }, // Assuming receptionists can't hard-delete appointments, just update status to cancelled
      { resource: 'Attendance', actions: ['C', 'R'] }, // Can check-in and view attendance
      { resource: 'Client', actions: ['C', 'R', 'U'] }
    ]
  }
];

const seedRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role ${roleData.name} already exists. Skipping.`);
      }
    }
    
    // Seed default Super Admin
    const User = require('../src/models/user.model');
    const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    
    if (superAdminRole) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@salon.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        await User.create({
          name: 'Super Admin',
          email: adminEmail,
          password: adminPassword,
          role: superAdminRole._id,
          salonId: null
        });
        console.log(`Created default Super Admin: ${adminEmail} / ${adminPassword}`);
      } else {
        console.log(`Default Super Admin (${adminEmail}) already exists. Skipping.`);
      }
    }
    
    // Seed default Salon for testing
    const Salon = require('../src/models/salon.model');
    const existingSalon = await Salon.findOne({ name: 'Default Test Salon' });
    let defaultSalon;
    if (!existingSalon) {
      defaultSalon = await Salon.create({
        name: 'Default Test Salon',
        latitude: 18.5204, // e.g. Pune latitude
        longitude: 73.8567, // e.g. Pune longitude
        allowedRadius: 500, // 500 meters
        subscriptionStatus: 'ACTIVE'
      });
      console.log(`Created default Salon: ${defaultSalon.name} (ID: ${defaultSalon._id})`);
    } else {
      defaultSalon = existingSalon;
      console.log(`Default Salon already exists (ID: ${defaultSalon._id}). Skipping.`);
    }
    
    console.log('Role and Default Data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();
