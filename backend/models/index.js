const sequelize = require('./database');
const User = require('./User');
const LicenseCode = require('./LicenseCode');
const Employee = require('./Employee'); // Import the new model

// Define existing associations
User.hasOne(LicenseCode, {
  foreignKey: 'usedBy',
  as: 'license'
});

LicenseCode.belongsTo(User, {
  foreignKey: 'usedBy',
  as: 'user'
});

// Export all models from this central file
module.exports = {
  sequelize,
  User,
  LicenseCode,
  Employee // Export the new model
};