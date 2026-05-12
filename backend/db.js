const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/PSSMS';

  await mongoose.connect(mongoUri, {
    dbName: process.env.DB_NAME || 'PSSMS',
  });

  return mongoose.connection;
};

module.exports = { connectDB };
