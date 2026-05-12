const User = require('../models/User');

const seedDefaultUser = async () => {
  const username = process.env.SEED_USERNAME || 'admin';
  const password = process.env.SEED_PASSWORD || 'Admin@1234';

  const existing = await User.findOne({ username });
  if (existing) {
    return existing;
  }

  const user = new User({
    username,
    password,
  });

  await user.save();
  return user;
};

module.exports = { seedDefaultUser };
