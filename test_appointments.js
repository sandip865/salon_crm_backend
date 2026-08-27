const mongoose = require('mongoose');
require('dotenv').config();

const appointmentService = require('./src/services/appointment.service');
const Salon = require('./src/models/salon.model');
const Staff = require('./src/models/staff.model');
const Client = require('./src/models/client.model');
const Service = require('./src/models/service.model');
const Appointment = require('./src/models/appointment.model');
const Plan = require('./src/models/plan.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_crm';

async function runTests() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for testing');

  try {
    // Setup test data
    const salon = await Salon.findOne();
    const staff = await Staff.findOne({ salonId: salon._id });
    const client = await Client.findOne({ salonId: salon._id });
    
    // Create services with required durations
    const haircut = await Service.create({ name: 'Haircut', durationInMinutes: 30, price: 50, salonId: salon._id });
    const facial = await Service.create({ name: 'Facial', durationInMinutes: 60, price: 100, salonId: salon._id });
    const hairColor = await Service.create({ name: 'Hair Color', durationInMinutes: 120, price: 150, salonId: salon._id });

    // Clean up appointments for this staff today
    await Appointment.deleteMany({ staff: staff._id, date: '2023-12-01' });

    console.log('\n--- Running Tests ---');

    // Test 1: Working hours — appointment must fall fully inside 09:00–20:00.
    console.log('\nTest 1: Working hours (09:00-20:00)');
    const t1_early = await appointmentService.create({
      client: client._id, service: haircut._id, staff: staff._id, date: '2023-12-01', startTime: '08:30'
    }, salon._id);
    console.log('08:30 Haircut (Expected Fail):', t1_early.message);

    const t1_late = await appointmentService.create({
      client: client._id, service: hairColor._id, staff: staff._id, date: '2023-12-01', startTime: '19:00'
    }, salon._id);
    console.log('19:00 Hair Color (120m) (Expected Fail):', t1_late.message);

    const t1_valid = await appointmentService.create({
      client: client._id, service: facial._id, staff: staff._id, date: '2023-12-01', startTime: '09:00'
    }, salon._id);
    console.log('09:00 Facial (60m) (Expected Success):', t1_valid.success);

    // Test 2: Staff conflict
    console.log('\nTest 2: Staff Conflict (10:00-11:00 vs 10:30-11:30)');
    // Existing 10:00-11:00
    await appointmentService.create({
      client: client._id, service: facial._id, staff: staff._id, date: '2023-12-01', startTime: '10:00'
    }, salon._id);

    // Try overlapping 10:30-11:30
    try {
      await appointmentService.create({
        client: client._id, service: facial._id, staff: staff._id, date: '2023-12-01', startTime: '10:30'
      }, salon._id);
    } catch (err) {
      console.log('10:30 Facial (Expected Fail - Conflict):', err.message);
    }

    // Try non-overlapping 11:00-11:30
    const t2_valid = await appointmentService.create({
      client: client._id, service: haircut._id, staff: staff._id, date: '2023-12-01', startTime: '11:00'
    }, salon._id);
    console.log('11:00 Haircut (Expected Success - No Conflict):', t2_valid.success);

    // Test 3: Cancelled appointments don't block a slot
    console.log('\nTest 3: Cancelled slots can be re-booked');
    
    // Create and cancel
    const apptToCancel = await appointmentService.create({
      client: client._id, service: haircut._id, staff: staff._id, date: '2023-12-01', startTime: '13:00'
    }, salon._id);
    await appointmentService.update(apptToCancel.data._id, { status: 'CANCELLED' }, salon._id);

    // Re-book 13:00
    const t3_rebook = await appointmentService.create({
      client: client._id, service: haircut._id, staff: staff._id, date: '2023-12-01', startTime: '13:00'
    }, salon._id);
    console.log('13:00 Haircut after cancellation (Expected Success):', t3_rebook.success);

    // Cleanup created services
    await Service.deleteMany({ _id: { $in: [haircut._id, facial._id, hairColor._id] } });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

runTests();
