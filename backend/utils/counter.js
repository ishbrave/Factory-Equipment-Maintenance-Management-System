const Counter = require('../models/Counter');

const getNextSequence = async (name) => {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return result.seq;
};

module.exports = { getNextSequence };
