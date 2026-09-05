const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  blockHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  previousHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transactions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  txCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  nonce: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  merkleRoot: {
    type: DataTypes.STRING,
    allowNull: true
  },
  consensusStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'VERIFIED'
  },
  validatorSignatures: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'blocks',
  timestamps: true
});

module.exports = Block;

