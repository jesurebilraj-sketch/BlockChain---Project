const { sequelize } = require('../config/database');
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const Shop = require('../models/Shop');
const Warehouse = require('../models/Warehouse');
const Commodity = require('../models/Commodity');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const BlockModel = require('../models/Block');
const Validator = require('../models/Validator');
const Block = require('../blockchain/Block');
const { generateSeedData } = require('./seedData');
const { validateChain } = require('../blockchain/validation');
const logger = require('../utils/logger');

async function seedDatabase(force = true) {
  try {
    logger.info(`Starting PDSChain database seeding (force: ${force})...`);

    // 1. Sync database schema
    await sequelize.sync({ force });
    logger.info('Database schema created/reset successfully.');

    // 2. Generate Synthetic Datasets
    const data = await generateSeedData();

    // 3. Bulk Insert
    await User.bulkCreate(data.users);
    logger.info(`Seeded ${data.users.length} user accounts with bcrypt hashed passwords.`);

    await Commodity.bulkCreate(data.commodities);
    logger.info(`Seeded ${data.commodities.length} commodities.`);

    await Beneficiary.bulkCreate(data.beneficiaries);
    logger.info(`Seeded ${data.beneficiaries.length} citizen beneficiaries.`);

    await Shop.bulkCreate(data.shops);
    logger.info(`Seeded ${data.shops.length} Fair Price Shops.`);

    await Warehouse.bulkCreate(data.warehouses);
    logger.info(`Seeded ${data.warehouses.length} Warehouses and Silos.`);

    await Inventory.bulkCreate(data.inventories);
    logger.info(`Seeded ${data.inventories.length} inventory stock allocations.`);

    await Validator.bulkCreate(data.validators);
    logger.info(`Seeded ${data.validators.length} FBA Validator Nodes.`);

    await Transaction.bulkCreate(data.transactions);
    logger.info(`Seeded ${data.transactions.length} verified transactions.`);

    // 4. Seed Verified Blockchain with Valid Cryptographic Hashes
    const allValidators = data.validators.map(v => v.validatorId);

    // Block 0: Genesis
    const genesis = new Block(
      0,
      '2026-01-01T00:00:00.000Z',
      [{ transactionId: 'GENESIS_TX', type: 'GENESIS', details: 'PDSChain Genesis Ledger Initialized' }],
      '0000000000000000000000000000000000000000000000000000000000000000',
      0,
      'VERIFIED',
      allValidators
    );
    genesis.mineBlock(2);

    // Block 1: Initial Procurement Block
    const block1 = new Block(
      1,
      '2026-08-28T09:00:00.000Z',
      [
        { transactionId: 'TRF-001', type: 'PROCUREMENT', item: 'Rice', qty: '10000 MT', to: 'WH-003' },
        { transactionId: 'TRF-002', type: 'PROCUREMENT', item: 'Wheat', qty: '6500 MT', to: 'WH-001' }
      ],
      genesis.blockHash,
      0,
      'VERIFIED',
      allValidators
    );
    block1.mineBlock(2);

    // Block 2: Dispatches & Early Distributions
    const block2 = new Block(
      2,
      '2026-08-29T11:45:00.000Z',
      [
        data.transactions[4],
        { transactionId: 'TXF-102', from: 'WH-003', to: 'FPS-102', item: 'Rice', qty: '500 KG' }
      ],
      block1.blockHash,
      0,
      'VERIFIED',
      allValidators
    );
    block2.mineBlock(2);

    // Block 3: Recent Distributions Block
    const block3 = new Block(
      3,
      '2026-08-30T08:35:00.000Z',
      [data.transactions[2], data.transactions[3]],
      block2.blockHash,
      0,
      'VERIFIED',
      allValidators.slice(0, 11) // 11 of 12 agreed
    );
    block3.mineBlock(2);

    // Block 4: Latest Verified Block
    const block4 = new Block(
      4,
      '2026-08-30T09:42:00.000Z',
      [data.transactions[0], data.transactions[1]],
      block3.blockHash,
      0,
      'VERIFIED',
      allValidators
    );
    block4.mineBlock(2);

    const blocksToInsert = [genesis, block1, block2, block3, block4].map(b => b.toJSON());
    await BlockModel.bulkCreate(blocksToInsert);
    logger.info(`Seeded ${blocksToInsert.length} cryptographically verified blockchain blocks.`);

    // 5. Run Immediate Validation Check
    const chainValidation = validateChain([genesis, block1, block2, block3, block4]);
    if (!chainValidation.isValid) {
      throw new Error(`Seeded blockchain validation failed: ${chainValidation.reason}`);
    }
    logger.info(`Blockchain verification check passed 100%! Chain height: ${blocksToInsert.length}.`);

    // Synchronize blockchainService singleton
    const blockchainService = require('../services/blockchainService');
    await blockchainService.init();

    logger.info('==========================================================');
    logger.info(' PDSChain Database & Blockchain Seeding Completed Successfully!');
    logger.info('==========================================================');
    return true;
  } catch (err) {
    logger.error('Error during database seeding:', err);
    throw err;
  }
}

async function autoSeedIfEmpty() {
  const userCount = await User.count();
  if (userCount === 0) {
    logger.info('Empty database detected. Running automatic seed initialization...');
    await seedDatabase(false);
  }
}

// Execute standalone if called directly via CLI `npm run seed`
if (require.main === module) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  seedDatabase,
  autoSeedIfEmpty
};
