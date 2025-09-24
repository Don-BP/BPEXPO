const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // Corrected Path

const LicenseCode = sequelize.define('LicenseCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  employeeId: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'license_codes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// Static method to generate license code
LicenseCode.generateForEmployee = function(employeeId) {
  let hash = 0;
  for (let i = 0; i < employeeId.length; i++) {
    hash = ((hash << 5) - hash) + employeeId.charCodeAt(i);
    hash = hash & hash;
  }

  const part1 = Math.abs(hash % 10000).toString().padStart(4, '0');
  const part2 = Math.abs((hash >> 4) % 10000).toString().padStart(4, '0');

  return `BP-${part1}-${part2}`;
};

// Instance methods
LicenseCode.prototype.markAsUsed = function(userId) {
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new date();
  return this.save();
};

LicenseCode.prototype.markAsUnused = function() {
  this.isUsed = false;
  this.usedBy = null;
  this.usedAt = null;
  return this.save();
};

module.exports = LicenseCode;