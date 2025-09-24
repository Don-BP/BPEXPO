const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, LicenseCode, Employee } = require('../models');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Input validation middleware
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  // --- UPDATED VALIDATION RULE FOR EMPLOYEE ID ---
  body('employeeId')
    .matches(/^[A-Z0-9]{4,8}$/)
    .withMessage('Employee ID must be 4-8 uppercase letters and numbers.'),
  // --- END OF UPDATE ---
  body('licenseCode').matches(/^BP-[A-Z0-9]{4}-[A-Z0-9]{4}$/).withMessage('Invalid license code format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION_ERROR' });
    }

    const { username, email, employeeId, licenseCode, password } = req.body;
    const upperCaseEmployeeId = employeeId.toUpperCase();

    // Whitelist Check
    let isWhitelisted = false;
    if (upperCaseEmployeeId === 'BPDON' || upperCaseEmployeeId === 'BPJOE') {
        isWhitelisted = true;
    } else {
        const employeeInDb = await Employee.findOne({ where: { employeeId: upperCaseEmployeeId } });
        if (employeeInDb) {
            isWhitelisted = true;
        }
    }

    if (!isWhitelisted) {
        return res.status(400).json({
            message: 'Employee ID not found in whitelist. Please contact your administrator.',
            code: 'EMPLOYEE_NOT_WHITELISTED'
        });
    }

    const expectedCode = LicenseCode.generateForEmployee(upperCaseEmployeeId);
    if (licenseCode !== expectedCode) {
      return res.status(400).json({ message: 'Invalid license code for this Employee ID.', code: 'INVALID_LICENSE_CODE' });
    }

    const existingLicense = await LicenseCode.findOne({ where: { code: licenseCode } });
    if (existingLicense && existingLicense.isUsed) {
      return res.status(400).json({ message: 'This license code has already been used.', code: 'LICENSE_CODE_USED' });
    }

    const existingUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.', code: 'USER_EXISTS' });
    }

    const role = (upperCaseEmployeeId === 'BPDON' || upperCaseEmployeeId === 'BPJOE') ? 'admin' : 'user';
    const user = await User.create({ username, email, employeeId: upperCaseEmployeeId, licenseCode, password, role });

    const [licenseDoc] = await LicenseCode.findOrCreate({
      where: { code: licenseCode },
      defaults: { employeeId: upperCaseEmployeeId }
    });
    await licenseDoc.update({ isUsed: true, usedBy: user.id, usedAt: new Date() });

    const token = generateToken(user.id);
    res.status(201).json({ message: 'Account created successfully', token, user: user.toPublicData(), code: 'REGISTRATION_SUCCESS' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', code: 'REGISTRATION_ERROR' });
  }
});

// Login user
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION_ERROR' });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username: username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password', code: 'INVALID_CREDENTIALS' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated', code: 'ACCOUNT_INACTIVE' });
    }
    if (user.isAccountLocked()) {
      return res.status(401).json({ message: 'Account is temporarily locked due to too many failed login attempts', code: 'ACCOUNT_LOCKED' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid username or password', code: 'INVALID_CREDENTIALS' });
    }

    await user.resetLoginAttempts();
    const token = generateToken(user.id);
    res.json({ message: 'Login successful', token, user: user.toPublicData(), code: 'LOGIN_SUCCESS' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', code: 'LOGIN_ERROR' });
  }
});

module.exports = router;