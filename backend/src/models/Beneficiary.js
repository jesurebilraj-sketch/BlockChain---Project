const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Beneficiary = sequelize.define('Beneficiary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  beneficiaryId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'e.g. BEN-1001'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Chennai Central'
  },
  household: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },
  eligibilityStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  monthlyEntitlement: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      Rice: 20,
      Wheat: 10,
      Sugar: 2,
      Pulses: 2,
      Kerosene: 1
    }
  },
  currentMonthClaimed: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      Rice: 0,
      Wheat: 0,
      Sugar: 0,
      Pulses: 0,
      Kerosene: 0
    }
  },
  lastDist: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'beneficiaries',
  timestamps: true
});

module.exports = Beneficiary;

