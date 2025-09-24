const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bplabo_cdsc1',
  process.env.DB_USER || 'bplabo_cdsc1',
  process.env.DB_PASS || 'EEeiUZ8VrdR5',
  {
    dialect: 'mysql',
    logging: console.log, // Set to false to hide SQL queries in terminal, or console.log to show them
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, // Correctly placed in the pool settings
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    },
    // Use socket connection for shared hosting
    dialectOptions: {
      socketPath: '/var/lib/mysql/mysql.sock',
      connectTimeout: 60000 // This is the correct option for connection timeout
    }
  }
);

// Test connection first
sequelize.authenticate()
  .then(() => console.log('✅ MySQL connected via socket'))
  .catch(err => {
    console.error('❌ MySQL connection error:', err);
    console.error('Socket path tried: /var/lib/mysql/mysql.sock');
  });

module.exports = sequelize;