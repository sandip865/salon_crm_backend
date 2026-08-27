const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Salon = require('../src/models/salon.model');
const Service = require('../src/models/service.model');
const Plan = require('../src/models/plan.model');
require('dotenv').config({ path: '../.env' });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm');
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await Plan.deleteMany({});

    // 1. Create a Plan
    const basicPlan = await Plan.create({
      name: 'Basic Plan',
      price: 50,
      durationInDays: 30,
      maxStaff: 5,
      maxAppointments: 100
    });

    // 2. Create a Salon
    const salon = await Salon.create({
      name: 'Evaluation Salon',
      latitude: 18.5204, // Pune lat
      longitude: 73.8567, // Pune long
      allowedRadius: 500, // 500 meters
      currentPlan: basicPlan._id,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subscriptionStatus: 'ACTIVE',
      workingHours: { start: '09:00', end: '20:00' }
    });

    // 3. Create Super Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@crm.com',
      password: 'password123', // Assuming pre-save hook handles hashing
      role: 'SUPER_ADMIN'
    });

    // 4. Create Salon Owner
    await User.create({
      name: 'Salon Owner',
      email: 'owner@crm.com',
      password: 'password123',
      role: 'OWNER',
      salonId: salon._id
    });

    // 5. Create Receptionist
    await User.create({
      name: 'Receptionist',
      email: 'receptionist@crm.com',
      password: 'password123',
      role: 'RECEPTIONIST',
      salonId: salon._id
    });

    // 6. Create Default Services
    await Service.insertMany([
      { name: 'Haircut', durationInMinutes: 30, price: 20, salonId: salon._id },
      { name: 'Facial', durationInMinutes: 60, price: 40, salonId: salon._id },
      { name: 'Hair Color', durationInMinutes: 120, price: 80, salonId: salon._id }
    ]);

    console.log('Database Seeded Successfully!');
    console.log('Test Accounts:');
    console.log('admin@crm.com / password123');
    console.log('owner@crm.com / password123');
    console.log('receptionist@crm.com / password123');

    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
