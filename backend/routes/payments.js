const express = require('express');
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSlot = require('../models/ParkingSlot');
const { calculateDurationHours, calculateAmountPaid } = require('../utils/billing');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { recordId, paymentDate } = req.body;

    if (recordId === undefined || recordId === null || !paymentDate) {
      return res.status(400).json({ message: 'RecordID and PaymentDate are required.' });
    }

    const parsedRecordId = Number(recordId);
    if (!Number.isInteger(parsedRecordId) || parsedRecordId < 1) {
      return res.status(400).json({ message: 'RecordID must be a positive integer.' });
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({ message: 'PaymentDate must be a valid date.' });
    }

    const existingPayment = await Payment.findOne({ recordId: parsedRecordId });
    if (existingPayment) {
      return res.status(409).json({ message: 'Payment already exists for this record.' });
    }

    const record = await ParkingRecord.findOne({ recordId: parsedRecordId });
    if (!record) {
      return res.status(404).json({ message: 'Parking record not found.' });
    }

    // Payment moment means customer is exiting now.
    if (!record.exitTime) {
      record.exitTime = new Date();
    }

    const duration = calculateDurationHours(record.entryTime, record.exitTime);
    if (duration === null) {
      return res.status(400).json({ message: 'Invalid record times for billing.' });
    }

    record.duration = duration;
    await record.save();

    const amountPaid = calculateAmountPaid(duration);

    const payment = await Payment.create({
      recordId: parsedRecordId,
      paymentDate: parsedPaymentDate,
      amountPaid,
    });

    await ParkingSlot.updateOne({ slotNumber: record.slotNumber }, { $set: { slotStatus: 'Available' } });

    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create payment.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: 'parkingrecords',
          localField: 'recordId',
          foreignField: 'recordId',
          as: 'record',
        },
      },
      {
        $addFields: {
          record: { $arrayElemAt: ['$record', 0] },
        },
      },
      {
        $lookup: {
          from: 'cars',
          localField: 'record.plateNumber',
          foreignField: 'plateNumber',
          as: 'car',
        },
      },
      {
        $lookup: {
          from: 'parkingslots',
          localField: 'record.slotNumber',
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
        $project: {
          _id: 0,
          paymentId: 1,
          amountPaid: 1,
          paymentDate: 1,
          recordId: 1,
          record: {
            entryTime: '$record.entryTime',
            exitTime: '$record.exitTime',
            duration: '$record.duration',
          },
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
      {
        $sort: { paymentDate: -1, paymentId: -1 },
      },
    ]);

    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch payments.', error: error.message });
  }
});

router.get('/report/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const matchStage = {};

    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);

      if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
        return res.status(400).json({ message: 'Date filter must be in YYYY-MM-DD format.' });
      }

      matchStage.paymentDate = { $gte: dayStart, $lte: dayEnd };
    }

    const dailyData = await Payment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'parkingrecords',
          localField: 'recordId',
          foreignField: 'recordId',
          as: 'record',
        },
      },
      {
        $addFields: {
          record: { $arrayElemAt: ['$record', 0] },
        },
      },
      {
        $project: {
          paymentDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$paymentDate',
            },
          },
          plateNumber: '$record.plateNumber',
          entryTime: '$record.entryTime',
          exitTime: '$record.exitTime',
          duration: '$record.duration',
          amountPaid: '$amountPaid',
        },
      },
      {
        $sort: {
          paymentDate: -1,
          entryTime: -1,
        },
      },
      {
        $group: {
          _id: '$paymentDate',
          records: {
            $push: {
              plateNumber: '$plateNumber',
              entryTime: '$entryTime',
              exitTime: '$exitTime',
              duration: '$duration',
              amountPaid: '$amountPaid',
              paymentDate: '$paymentDate',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          records: 1,
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    return res.json(dailyData);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch daily report.', error: error.message });
  }
});

router.put('/:paymentId', async (req, res) => {
  try {
    const parsedPaymentId = Number(req.params.paymentId);
    if (!Number.isInteger(parsedPaymentId) || parsedPaymentId < 1) {
      return res.status(400).json({ message: 'PaymentID must be a positive integer.' });
    }

    const { paymentDate } = req.body;
    if (!paymentDate) {
      return res.status(400).json({ message: 'PaymentDate is required.' });
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({ message: 'PaymentDate must be a valid date.' });
    }

    const payment = await Payment.findOne({ paymentId: parsedPaymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    payment.paymentDate = parsedPaymentDate;
    await payment.save();

    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update payment.', error: error.message });
  }
});

router.delete('/:paymentId', async (req, res) => {
  try {
    const parsedPaymentId = Number(req.params.paymentId);
    if (!Number.isInteger(parsedPaymentId) || parsedPaymentId < 1) {
      return res.status(400).json({ message: 'PaymentID must be a positive integer.' });
    }

    const deleted = await Payment.findOneAndDelete({ paymentId: parsedPaymentId });
    if (!deleted) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.json({ message: 'Payment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete payment.', error: error.message });
  }
});

module.exports = router;
