const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Validator = sequelize.define('Validator', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  validatorId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'e.g. VAL-01 / NODE-01'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  org: {
    type: DataTypes.STRING,
    allowNull: false
  },
  publicKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Online', 'Offline', 'Degraded'),
    allowNull: false,
    defaultValue: 'Online'
  },
  blockHeight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4281
  },
  heartbeat: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Just now'
  },
  txValidated: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 14280
  },
  participation: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '100%'
  },
  trustConfiguration: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      threshold: 3,
      quorumSlice: []
    }
  }
}, {
  tableName: 'validators',
  timestamps: true
});

module.exports = Validator;

