const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingRecord = require('../models/ParkingRecord');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { slotNumber, slotStatus } = req.body;

    if (slotNumber === undefined || slotNumber === null) {
      return res.status(400).json({ message: 'SlotNumber is required.' });
    }

    const parsedSlotNumber = Number(slotNumber);
    if (!Number.isInteger(parsedSlotNumber) || parsedSlotNumber < 1 || parsedSlotNumber > 999) {
      return res.status(400).json({ message: 'SlotNumber must be an integer from 1 to 999 (format P-001 … P-999).' });
    }

    const normalizedStatus = slotStatus || 'Available';
    if (!['Available', 'Occupied'].includes(normalizedStatus)) {
      return res.status(400).json({ message: "SlotStatus must be 'Available' or 'Occupied'." });
    }

    const existingSlot = await ParkingSlot.findOne({ slotNumber: parsedSlotNumber });
    if (existingSlot) {
      return res.status(409).json({ message: 'SlotNumber already exists.' });
    }

    const slot = await ParkingSlot.create({
      slotNumber: parsedSlotNumber,
      slotStatus: normalizedStatus,
    });

    return res.status(201).json(slot);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create parking slot.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    return res.json(slots);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch parking slots.', error: error.message });
  }
});

router.put('/:slotNumber', async (req, res) => {
  try {
    console.log('PUT /slots/:slotNumber - Params:', req.params);
    console.log('PUT /slots/:slotNumber - Body:', req.body);
    const parsedSlotNumber = Number(req.params.slotNumber);
    if (!Number.isInteger(parsedSlotNumber) || parsedSlotNumber < 1 || parsedSlotNumber > 999) {
      console.log('PUT /slots - Slot number validation failed:', parsedSlotNumber);
      return res.status(400).json({ message: 'SlotNumber must be an integer from 1 to 999.' });
    }

    const { slotStatus } = req.body;
    if (!slotStatus) {
      return res.status(400).json({ message: 'SlotStatus is required.' });
    }

    if (!['Available', 'Occupied'].includes(slotStatus)) {
      return res.status(400).json({ message: "SlotStatus must be 'Available' or 'Occupied'." });
    }

    const slot = await ParkingSlot.findOne({ slotNumber: parsedSlotNumber });
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found.' });
    }

    slot.slotStatus = slotStatus;
    await slot.save();

    return res.json(slot);
  } catch (error) {
    console.error('PUT /slots error:', error.message, error);
    return res.status(500).json({ message: 'Failed to update parking slot.', error: error.message });
  }
});

router.delete('/:slotNumber', async (req, res) => {
  try {
    const parsedSlotNumber = Number(req.params.slotNumber);
    if (!Number.isInteger(parsedSlotNumber) || parsedSlotNumber < 1 || parsedSlotNumber > 999) {
      return res.status(400).json({ message: 'SlotNumber must be an integer from 1 to 999.' });
    }

    const slot = await ParkingSlot.findOne({ slotNumber: parsedSlotNumber });
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found.' });
    }

    if (slot.slotStatus === 'Occupied') {
      return res.status(409).json({ message: 'Cannot delete an occupied slot.' });
    }

    const activeRecord = await ParkingRecord.findOne({
      slotNumber: parsedSlotNumber,
      $or: [{ exitTime: null }, { exitTime: { $exists: false } }],
    });

    if (activeRecord) {
      return res.status(409).json({ message: 'Cannot delete slot linked to an active parking record.' });
    }

    await ParkingSlot.deleteOne({ slotNumber: parsedSlotNumber });
    return res.json({ message: 'Parking slot deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete parking slot.', error: error.message });
  }
});

module.exports = router;
