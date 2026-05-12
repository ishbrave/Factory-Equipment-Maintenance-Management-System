const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

const SESSION_COOKIE_NAME = 'pssms.sid';

const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.user = {
      userId: user.userId,
      username: user.username,
    };

    return res.json({
      message: 'Login successful.',
      user: req.session.user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login.', error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to logout.' });
      }

      res.clearCookie(SESSION_COOKIE_NAME);
      return res.json({ message: 'Logout successful.' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to logout.', error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    return res.json({ user: req.session.user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get session user.', error: error.message });
  }
});

/** Admin recovery: issues a short-lived reset token (store in DB). */
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !String(username).trim()) {
      return res.status(400).json({ message: 'Username is required.' });
    }

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that username.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    return res.json({
      message: 'Recovery token created. Use it with Reset password within 1 hour.',
      resetToken,
      expiresAt: resetExpires.toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to start password recovery.', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { username, resetToken, newPassword } = req.body;

    if (!username || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Username, resetToken, and newPassword are required.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and a special character.',
      });
    }

    const user = await User.findOne({ username: String(username).trim() }).select(
      '+resetPasswordToken +resetPasswordExpires'
    );

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired recovery request.' });
    }

    if (user.resetPasswordToken !== String(resetToken).trim()) {
      return res.status(400).json({ message: 'Invalid recovery token.' });
    }

    if (user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Recovery token has expired. Request a new one.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Password updated successfully. You can sign in now.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password.', error: error.message });
  }
});

module.exports = router;
