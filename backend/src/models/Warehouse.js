const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  warehouseId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'e.g. WH-001'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '10,000 MT'
  },
  currentStock: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '8,000 MT'
  },
  utilization: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 80.0
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Operational'
  }
}, {
  tableName: 'warehouses',
  timestamps: true
});

module.exports = Warehouse;

