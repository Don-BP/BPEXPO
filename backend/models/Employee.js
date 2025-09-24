const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    comment: 'The unique ID for an employee who is allowed to register.'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'An optional name for easier identification.'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  comment: 'Master list of all employees authorized to have an account.'
});

module.exports = Employee;