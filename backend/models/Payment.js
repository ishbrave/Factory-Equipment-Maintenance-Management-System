const mongoose = require('mongoose');
const { getNextSequence } = require('../utils/counter');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: Number,
      unique: true,
      index: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    recordId: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre('validate', async function assignPaymentId(next) {
  if (!this.paymentId) {
    this.paymentId = await getNextSequence('payments');
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
