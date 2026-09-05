const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Beneficiary = require('./Beneficiary');
const Shop = require('./Shop');
const Warehouse = require('./Warehouse');
const Commodity = require('./Commodity');
const Inventory = require('./Inventory');
const Transaction = require('./Transaction');
const Block = require('./Block');
const Validator = require('./Validator');

// Define relationships where applicable
// Note: Keeping IDs decoupled through strings (e.g. beneficiaryId, shopId) aligns with PDS & Blockchain architecture

const db = {
  sequelize,
  testConnection,
  User,
  Beneficiary,
  Shop,
  Warehouse,
  Commodity,
  Inventory,
  Transaction,
  Block,
  Validator
};

module.exports = db;

