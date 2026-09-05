const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockTransfer = sequelize.define('StockTransfer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  transferId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  warehouseId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commodity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'KG'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Completed'
  },
  timestamp: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'stock_transfers',
  timestamps: true
});

module.exports = StockTransfer;

