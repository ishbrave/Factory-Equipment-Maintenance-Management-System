const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    slotStatus: {
      type: String,
      enum: ['Available', 'Occupied'],
      default: 'Available',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
