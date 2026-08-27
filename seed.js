const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/user.model');
const Salon = require('./src/models/salon.model');
const Plan = require('./src/models/plan.model');
const Role = require('./src/models/role.model');
const Staff = require('./src/models/staff.model');
const Client = require('./src/models/client.model');
const Service = require('./src/models/service.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Clear existing
    await User.deleteMany();
    await Salon.deleteMany();
    await Plan.deleteMany();
    await Staff.deleteMany();
    await Client.deleteMany();
    await Service.deleteMany();

    // 1. Create Roles
    const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    const salonOwnerRole = await Role.findOne({ name: 'SALON_OWNER' });
    const receptionistRole = await Role.findOne({ name: 'RECEPTIONIST' });

    // 2. Create Plans
    const basicPlan = await Plan.create({ name: 'Basic', price: 999, durationInDays: 30, maxStaff: 5, maxAppointments: 500 });
    const proPlan = await Plan.create({ name: 'Pro', price: 1999, durationInDays: 30, maxStaff: 15, maxAppointments: 2000 });

    // 3. Create Super Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@saloncrm.com',
      password: 'Admin@123',
      role: superAdminRole._id,
      salonId: null
    });
    console.log('Created Super Admin');

    // 4. Create Salons (Salon A and Salon B)
    const salonA = await Salon.create({
      name: 'Salon A',
      address: 'Pune City Center',
      latitude: 18.5204,
      longitude: 73.8567,
      allowedRadius: 500, // meters
      currentPlan: basicPlan._id,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionStatus: 'ACTIVE'
    });

    const salonB = await Salon.create({
      name: 'Salon B',
      address: 'Mumbai West',
      latitude: 19.0760,
      longitude: 72.8777,
      allowedRadius: 500,
      currentPlan: proPlan._id,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionStatus: 'ACTIVE'
    });
    console.log('Created Salons');

    // 5. Create Users (Owners and Receptionists)
    await User.create({ name: 'Owner A', email: 'ownerA@saloncrm.com', password: 'Owner@123', role: salonOwnerRole._id, salonId: salonA._id });
    await User.create({ name: 'Owner B', email: 'ownerB@saloncrm.com', password: 'Owner@123', role: salonOwnerRole._id, salonId: salonB._id });
    
    await User.create({ name: 'Rec A', email: 'receptionistA@saloncrm.com', password: 'Receptionist@123', role: receptionistRole._id, salonId: salonA._id });
    await User.create({ name: 'Rec B', email: 'receptionistB@saloncrm.com', password: 'Receptionist@123', role: receptionistRole._id, salonId: salonB._id });
    console.log('Created Owners and Receptionists');

    // 6. Create Services
    await Service.create([
      { name: 'Haircut', durationInMinutes: 30, price: 500, salonId: salonA._id },
      { name: 'Facial', durationInMinutes: 60, price: 1000, salonId: salonA._id },
      { name: 'Hair Color', durationInMinutes: 120, price: 2000, salonId: salonA._id },
      { name: 'Haircut', durationInMinutes: 30, price: 600, salonId: salonB._id },
      { name: 'Facial', durationInMinutes: 60, price: 1200, salonId: salonB._id },
    ]);

    // 7. Create Staff and Clients
    await Staff.create([
      { name: 'Staff A1', email: 'a1@staff.com', phone: '1111', salonId: salonA._id },
      { name: 'Staff A2', email: 'a2@staff.com', phone: '2222', salonId: salonA._id },
      { name: 'Staff B1', email: 'b1@staff.com', phone: '3333', salonId: salonB._id },
    ]);

    await Client.create([
      { name: 'Client A1', email: 'clienta1@mail.com', phone: '9991', salonId: salonA._id },
      { name: 'Client B1', email: 'clientb1@mail.com', phone: '9992', salonId: salonB._id },
    ]);

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
