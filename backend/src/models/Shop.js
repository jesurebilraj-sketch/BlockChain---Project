const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'e.g. FPS-101'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manager: {
    type: DataTypes.STRING,
    allowNull: false
  },
  beneficiariesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000
  },
  stockHealth: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Optimal'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended', 'Maintenance'),
    allowNull: false,
    defaultValue: 'Active'
  }
}, {
  tableName: 'shops',
  timestamps: true
});

module.exports = Shop;

