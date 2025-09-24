const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Correct: Import from central models index

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required', code: 'TOKEN_MISSING' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated', code: 'ACCOUNT_INACTIVE' });
    }
    if (user.isAccountLocked()) {
      return res.status(401).json({ message: 'Account is temporarily locked', code: 'ACCOUNT_LOCKED' });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', code: 'TOKEN_INVALID' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error', code: 'AUTH_ERROR' });
  }
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
};