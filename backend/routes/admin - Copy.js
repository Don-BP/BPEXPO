const express = require('express');
const { Op } = require('sequelize');
const { User, LicenseCode, Employee } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAdmin);

// --- 1. Employee Whitelist Management ---

router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['employeeId', 'ASC']] });
    res.json({ employees, code: 'EMPLOYEES_RETRIEVED' });
  } catch (error) {
    console.error('Get whitelisted employees error:', error);
    res.status(500).json({ message: 'Failed to retrieve employees', code: 'EMPLOYEES_RETRIEVE_ERROR' });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { employeeId, name } = req.body;
    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required', code: 'INVALID_INPUT' });
    }
    const newEmployee = await Employee.create({ employeeId: employeeId.toUpperCase(), name });
    res.status(201).json({ employee: newEmployee, message: 'Employee added to whitelist.', code: 'EMPLOYEE_CREATED' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Employee ID already exists in the whitelist.', code: 'DUPLICATE_EMPLOYEE_ID' });
    }
    console.error('Add whitelisted employee error:', error);
    res.status(500).json({ message: 'Failed to add employee', code: 'EMPLOYEE_CREATE_ERROR' });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const affectedRows = await Employee.destroy({ where: { id: req.params.id } });
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found', code: 'EMPLOYEE_NOT_FOUND' });
    }
    res.json({ message: 'Employee removed from whitelist.', code: 'EMPLOYEE_DELETED' });
  } catch (error) {
    console.error('Delete whitelisted employee error:', error);
    res.status(500).json({ message: 'Failed to remove employee', code: 'EMPLOYEE_DELETE_ERROR' });
  }
});

// --- 2. License Code Management ---

router.post('/license-codes/generate', async (req, res) => {
  try {
    const { employeeIds } = req.body;
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'employeeIds must be a non-empty array', code: 'INVALID_EMPLOYEE_IDS' });
    }

    const results = [];
    const errors = [];

    for (const employeeId of employeeIds) {
      try {
        const upperCaseId = employeeId.toUpperCase();
        const employee = await Employee.findOne({ where: { employeeId: upperCaseId } });
        if (!employee) {
          errors.push({ employeeId, error: 'Employee ID not in whitelist. Please add it first.' });
          continue;
        }

        const existingLicense = await LicenseCode.findOne({ where: { employeeId: upperCaseId } });
        if (existingLicense) {
          errors.push({ employeeId, error: 'License code already exists for this employee' });
          continue;
        }

        const code = LicenseCode.generateForEmployee(upperCaseId);
        await LicenseCode.create({ code, employeeId: upperCaseId });
        results.push({ employeeId, licenseCode: code, status: 'created' });
      } catch (error) {
        errors.push({ employeeId, error: error.message });
      }
    }
    res.json({ message: `Generated ${results.length} license codes`, results, errors, code: 'LICENSE_CODES_GENERATED' });
  } catch (error) {
    console.error('Generate license codes error:', error);
    res.status(500).json({ message: 'Failed to generate license codes', code: 'LICENSE_CODES_GENERATE_ERROR' });
  }
});

router.get('/license-codes', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;

        const { rows: licenses, count: totalLicenses } = await LicenseCode.findAndCountAll({
            include: [{ model: User, as: 'user', attributes: ['username'], required: false }],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        res.json({
            licenses,
            pagination: { page, limit, total: totalLicenses, pages: Math.ceil(totalLicenses / limit) },
            code: 'LICENSE_CODES_RETRIEVED'
        });
    } catch (error) {
        console.error('Get license codes error:', error);
        res.status(500).json({ message: 'Failed to retrieve license codes', code: 'LICENSE_CODES_RETRIEVE_ERROR' });
    }
});

// --- 3. User Account Management ---

router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    res.json({ users, pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) }, code: 'USERS_RETRIEVED' });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users', code: 'USERS_RETRIEVE_ERROR' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (req.user.id.toString() === userId) {
      return res.status(403).json({ message: 'You cannot change your own role.', code: 'CANNOT_CHANGE_OWN_ROLE' });
    }
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Invalid role specified. Must be "admin" or "user".', code: 'INVALID_ROLE' });
    }

    const [affectedRows] = await User.update({ role }, { where: { id: userId } });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    res.json({ message: `User role updated successfully to ${role}`, code: 'USER_ROLE_UPDATED' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role', code: 'USER_ROLE_UPDATE_ERROR' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    if (user.licenseCode) {
      await LicenseCode.update({ isUsed: false, usedBy: null, usedAt: null }, { where: { code: user.licenseCode } });
    }

    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully', code: 'USER_DELETED' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', code: 'USER_DELETE_ERROR' });
  }
});

// --- 4. System Statistics ---

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const totalLicenses = await LicenseCode.count();
    const usedLicenses = await LicenseCode.count({ where: { isUsed: true } });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalLicenses,
        usedLicenses,
        availableLicenses: totalLicenses - usedLicenses,
        recentRegistrations,
      },
      code: 'STATS_RETRIEVED'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve statistics', code: 'STATS_RETRIEVE_ERROR' });
  }
});

module.exports = router;