const mongoose = require('mongoose');
const { getNextSequence } = require('../utils/counter');

const parkingRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: Number,
      unique: true,
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    slotNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    plateNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
  },
  {
    timestamps: true,
  }
);

parkingRecordSchema.pre('validate', async function assignRecordId(next) {
  if (!this.recordId) {
    this.recordId = await getNextSequence('parkingRecords');
  }
  next();
});

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
