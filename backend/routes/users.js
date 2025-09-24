const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Correct: Import from central models index

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicData(),
      code: 'PROFILE_RETRIEVED'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile', code: 'PROFILE_RETRIEVE_ERROR' });
  }
});

// Update user profile
router.put('/profile', [
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Invalid username format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION_ERROR' });
    }

    const { email, username } = req.body;
    const updates = {};
    const userId = req.user.id;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email address is already in use', code: 'EMAIL_EXISTS' });
      }
      updates.email = email;
    }

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username: username } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Username is already taken', code: 'USERNAME_EXISTS' });
      }
      updates.username = username;
    }

    if (Object.keys(updates).length === 0) {
        return res.json({ message: 'No changes to update.', user: req.user.toPublicData(), code: 'NO_CHANGES' });
    }

    await User.update(updates, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toPublicData(),
      code: 'PROFILE_UPDATED'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', code: 'PROFILE_UPDATE_ERROR' });
  }
});

// Change password
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION_ERROR' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect', code: 'INVALID_CURRENT_PASSWORD' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully', code: 'PASSWORD_CHANGED' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', code: 'PASSWORD_CHANGE_ERROR' });
  }
});

module.exports = router;