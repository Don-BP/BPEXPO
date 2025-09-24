const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import central database and model hub
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://bplabo.jp',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// --- SIMPLIFIED SERVER START ---
// Test the database connection, then start the server.
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 BP LABO Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'https://bplabo.jp'}`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
    console.error('❌ Server did not start.');
  });

module.exports = app;