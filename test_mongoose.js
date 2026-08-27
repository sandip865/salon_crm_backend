const mongoose = require('mongoose');
const Plan = require('./src/models/plan.model');
require('dotenv').config();

async function testMongoose() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm');
  try {
    const doc = await Plan.create({
      name: 'salon plan',
      price: 100,
      durationInDays: 1,
      maxStaff: 3,
      maxAppointments: 5
    });
    console.log('Created successfully:', doc);
  } catch (err) {
    console.log('Error creating plan:', err);
  }
  mongoose.disconnect();
}

testMongoose();
