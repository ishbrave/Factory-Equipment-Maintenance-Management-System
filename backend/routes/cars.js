const express = require('express');
const Car = require('../models/Car');
const ParkingRecord = require('../models/ParkingRecord');

const router = express.Router();

const normalizePlate = (raw) => String(raw || '').replace(/\s+/g, '').toUpperCase();
const plateOk = (p) => /^[A-Z]{3}\d{3}[A-Z]$/.test(p);
const nameOk = (n) => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(String(n || '').trim()) && String(n).trim().length >= 2;
const normalizePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('2507')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('07')) return `+250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('7')) return `+250${digits}`;
  return null;
};

router.post('/', async (req, res) => {
  try {
    const { plateNumber, driverName, phoneNumber } = req.body;
    console.log('POST /cars - Received:', { plateNumber, driverName, phoneNumber });

    if (!plateNumber || !driverName || !phoneNumber) {
      return res.status(400).json({ message: 'PlateNumber, DriverName, and PhoneNumber are required.' });
    }

    const normalizedPlate = normalizePlate(plateNumber);
    console.log('Normalized plate:', normalizedPlate);
    if (!plateOk(normalizedPlate)) {
      console.log('Plate validation failed');
      return res.status(400).json({
        message: 'Plate number must match Rwanda format: 3 letters + 3 digits + 1 letter (e.g. RAD123A).',
      });
    }

    if (!nameOk(driverName)) {
      return res.status(400).json({ message: 'Driver name must contain letters and spaces only.' });
    }

    const phone = normalizePhone(phoneNumber);
    if (!phone || phone.length !== 13) {
      return res.status(400).json({ message: 'Phone must be a valid Rwanda number (+2507…, 07…, or 7…).' });
    }

    const existingCar = await Car.findOne({ plateNumber: normalizedPlate });
    if (existingCar) {
      return res.status(409).json({ message: 'PlateNumber already exists.' });
    }

    const car = await Car.create({
      plateNumber: normalizedPlate,
      driverName: String(driverName).trim(),
      phoneNumber: phone,
    });

    return res.status(201).json(car);
  } catch (error) {
    console.error('POST /cars error:', error.message, error);
    return res.status(500).json({ message: 'Failed to register car.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    return res.json(cars);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch cars.', error: error.message });
  }
});

router.put('/:plateNumber', async (req, res) => {
  try {
    const normalizedOldPlate = normalizePlate(req.params.plateNumber);
    console.log('PUT /cars/:plateNumber - Params:', req.params);
    console.log('PUT /cars/:plateNumber - Body:', req.body);
    if (!plateOk(normalizedOldPlate)) {
      console.log('PUT /cars - Old plate validation failed:', normalizedOldPlate);
      return res.status(400).json({ message: 'Invalid plate number format.' });
    }

    const { plateNumber, driverName, phoneNumber } = req.body;
    if (!driverName || !phoneNumber) {
      return res.status(400).json({ message: 'DriverName and PhoneNumber are required.' });
    }

    if (!nameOk(driverName)) {
      return res.status(400).json({ message: 'Driver name must contain letters and spaces only.' });
    }

    const phone = normalizePhone(phoneNumber);
    if (!phone || phone.length !== 13) {
      return res.status(400).json({ message: 'Phone must be a valid Rwanda number.' });
    }

    const car = await Car.findOne({ plateNumber: normalizedOldPlate });
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    let newPlate = normalizedOldPlate;
    if (plateNumber) {
      newPlate = normalizePlate(plateNumber);
      console.log('PUT /cars - New plate:', newPlate);
      if (!plateOk(newPlate)) {
        console.log('PUT /cars - New plate validation failed');
        return res.status(400).json({ message: 'New plate number must match Rwanda format.' });
      }
      if (newPlate !== normalizedOldPlate) {
        const existing = await Car.findOne({ plateNumber: newPlate });
        if (existing) {
          return res.status(409).json({ message: 'New plate number already exists.' });
        }
      }
    }

    car.plateNumber = newPlate;
    car.driverName = String(driverName).trim();
    car.phoneNumber = phone;
    await car.save();

    return res.json(car);
  } catch (error) {
    console.error('PUT /cars error:', error.message, error);
    return res.status(500).json({ message: 'Failed to update car.', error: error.message });
  }
});

router.delete('/:plateNumber', async (req, res) => {
  try {
    const normalizedPlate = normalizePlate(req.params.plateNumber);
    if (!plateOk(normalizedPlate)) {
      return res.status(400).json({ message: 'Invalid plate number format.' });
    }

    const active = await ParkingRecord.findOne({
      plateNumber: normalizedPlate,
      $or: [{ exitTime: null }, { exitTime: { $exists: false } }],
    });

    if (active) {
      return res.status(409).json({ message: 'Cannot delete car with an active parking record.' });
    }

    const deleted = await Car.findOneAndDelete({ plateNumber: normalizedPlate });
    if (!deleted) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    return res.json({ message: 'Car deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete car.', error: error.message });
  }
});

module.exports = router;
