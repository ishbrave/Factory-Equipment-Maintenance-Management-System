const express = require('express');
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSlot = require('../models/ParkingSlot');
const Car = require('../models/Car');
const Payment = require('../models/Payment');
const { calculateDurationHours } = require('../utils/billing');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { plateNumber, slotNumber, entryTime, exitTime } = req.body;

    if (!plateNumber || slotNumber === undefined || slotNumber === null || !entryTime) {
      return res.status(400).json({ message: 'PlateNumber, SlotNumber, and EntryTime are required.' });
    }

    const normalizedPlate = String(plateNumber).trim().toUpperCase();
    const parsedSlotNumber = Number(slotNumber);

    if (!Number.isInteger(parsedSlotNumber) || parsedSlotNumber < 1 || parsedSlotNumber > 999) {
      return res.status(400).json({ message: 'SlotNumber must be an integer from 1 to 999 (format P-001 … P-999).' });
    }

    const parsedEntryTime = new Date(entryTime);
    if (Number.isNaN(parsedEntryTime.getTime())) {
      return res.status(400).json({ message: 'EntryTime must be a valid datetime.' });
    }

    let parsedExitTime = null;
    let duration = null;

    if (exitTime) {
      parsedExitTime = new Date(exitTime);
      if (Number.isNaN(parsedExitTime.getTime())) {
        return res.status(400).json({ message: 'ExitTime must be a valid datetime.' });
      }

      duration = calculateDurationHours(parsedEntryTime, parsedExitTime);
      if (duration === null) {
        return res.status(400).json({ message: 'ExitTime must be later than EntryTime.' });
      }
    }

    const car = await Car.findOne({ plateNumber: normalizedPlate });
    if (!car) {
      return res.status(404).json({ message: 'Car not found. Register the car first.' });
    }

    const slot = await ParkingSlot.findOne({ slotNumber: parsedSlotNumber });
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found.' });
    }

    if (slot.slotStatus === 'Occupied') {
      return res.status(400).json({ message: 'Parking slot is already occupied.' });
    }

    const record = await ParkingRecord.create({
      plateNumber: normalizedPlate,
      slotNumber: parsedSlotNumber,
      entryTime: parsedEntryTime,
      exitTime: parsedExitTime,
      duration,
    });

    slot.slotStatus = 'Occupied';
    await slot.save();

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create parking record.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await ParkingRecord.aggregate([
      {
        $lookup: {
          from: 'cars',
          localField: 'plateNumber',
          foreignField: 'plateNumber',
          as: 'car',
        },
      },
      {
        $lookup: {
          from: 'parkingslots',
          localField: 'slotNumber',
          foreignField: 'slotNumber',
          as: 'slot',
        },
      },
      {
        $addFields: {
          car: { $arrayElemAt: ['$car', 0] },
          slot: { $arrayElemAt: ['$slot', 0] },
        },
      },
      {
        $sort: { entryTime: -1 },
      },
      {
        $project: {
          _id: 0,
          recordId: 1,
          plateNumber: 1,
          slotNumber: 1,
          entryTime: 1,
          exitTime: 1,
          duration: 1,
          car: {
            plateNumber: '$car.plateNumber',
            driverName: '$car.driverName',
            phoneNumber: '$car.phoneNumber',
          },
          slot: {
            slotNumber: '$slot.slotNumber',
            slotStatus: '$slot.slotStatus',
          },
        },
      },
    ]);

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch parking records.', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const parsedRecordId = Number(req.params.id);
    if (!Number.isInteger(parsedRecordId) || parsedRecordId < 1) {
      return res.status(400).json({ message: 'RecordID must be a positive integer.' });
    }

    const record = await ParkingRecord.findOne({ recordId: parsedRecordId });
    if (!record) {
      return res.status(404).json({ message: 'Parking record not found.' });
    }

    const rawExitTime = req.body.exitTime || new Date().toISOString();
    const parsedExitTime = new Date(rawExitTime);

    if (Number.isNaN(parsedExitTime.getTime())) {
      return res.status(400).json({ message: 'ExitTime must be a valid datetime.' });
    }

    const duration = calculateDurationHours(record.entryTime, parsedExitTime);
    if (duration === null) {
      return res.status(400).json({ message: 'ExitTime must be later than EntryTime.' });
    }

    record.exitTime = parsedExitTime;
    record.duration = duration;
    await record.save();

    await ParkingSlot.updateOne({ slotNumber: record.slotNumber }, { $set: { slotStatus: 'Available' } });

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update parking record.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const parsedRecordId = Number(req.params.id);
    if (!Number.isInteger(parsedRecordId) || parsedRecordId < 1) {
      return res.status(400).json({ message: 'RecordID must be a positive integer.' });
    }

    const deletedRecord = await ParkingRecord.findOneAndDelete({ recordId: parsedRecordId });
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Parking record not found.' });
    }

    await Payment.deleteOne({ recordId: parsedRecordId });
    await ParkingSlot.updateOne({ slotNumber: deletedRecord.slotNumber }, { $set: { slotStatus: 'Available' } });

    return res.json({ message: 'Parking record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete parking record.', error: error.message });
  }
});

module.exports = router;
