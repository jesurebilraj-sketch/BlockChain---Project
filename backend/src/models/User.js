const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'WAREHOUSE', 'SHOP', 'CITIZEN', 'VALIDATOR'),
    allowNull: false,
    defaultValue: 'CITIZEN'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Associated Beneficiary ID, Shop ID, Warehouse ID, or Validator ID'
  }
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['passwordHash'] }
  },
  scopes: {
    withPassword: {
      attributes: {}
    }
  }
});

module.exports = User;

