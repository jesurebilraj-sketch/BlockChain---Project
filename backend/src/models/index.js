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
const StockTransfer = require('./StockTransfer');

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
  Validator,
  StockTransfer
};

module.exports = db;

