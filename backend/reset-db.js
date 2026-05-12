const { connectDB } = require('./db');
const Car = require('./models/Car');
const ParkingSlot = require('./models/ParkingSlot');
const ParkingRecord = require('./models/ParkingRecord');
const Payment = require('./models/Payment');
const User = require('./models/User');

const resetDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear all collections except users
    await Car.deleteMany({});
    await ParkingSlot.deleteMany({});
    await ParkingRecord.deleteMany({});
    await Payment.deleteMany({});

    console.log('Database reset complete - all cars, slots, records, and payments cleared');
    console.log('Users preserved for authentication');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();