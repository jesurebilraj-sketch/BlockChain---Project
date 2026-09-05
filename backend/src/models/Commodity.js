const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Commodity = sequelize.define('Commodity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  commodityId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'KG'
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0 // Subsidized
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Food Grain'
  }
}, {
  tableName: 'commodities',
  timestamps: true
});

module.exports = Commodity;

