const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./database'); // Corrected Path

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  employeeId: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  licenseCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

User.prototype.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.update({
      loginAttempts: 1,
      lockUntil: null
    });
  }

  const updates = { loginAttempts: this.loginAttempts + 1 };

  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }

  return this.update(updates);
};

User.prototype.resetLoginAttempts = function() {
  return this.update({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date()
  });
};

User.prototype.toPublicData = function() {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    employeeId: this.employeeId,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
};

module.exports = User;