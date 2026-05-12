require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./db');
const { seedDefaultUser } = require('./utils/seedDefaultUser');

const run = async () => {
  try {
    await connectDB();
    await seedDefaultUser();
    console.log('Seed completed. Default user is available.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
