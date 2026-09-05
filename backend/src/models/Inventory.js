const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ownerType: {
    type: DataTypes.ENUM('SHOP', 'WAREHOUSE'),
    allowNull: false,
    defaultValue: 'SHOP'
  },
  ownerId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'shopId (e.g. FPS-101) or warehouseId (e.g. WH-001)'
  },
  commodityName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reserved: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'KG'
  },
  minThreshold: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 100
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ownerType', 'ownerId', 'commodityName']
    }
  ]
});

module.exports = Inventory;

