const Block = require('./Block');
const { validateChain } = require('./validation');
const config = require('../config/env');
const logger = require('../utils/logger');

class Blockchain {
  constructor(difficulty = config.BLOCKCHAIN_DIFFICULTY) {
    this.chain = [];
    this.difficulty = difficulty;
  }

  createGenesisBlock() {
    const genesis = new Block(
      0,
      '2026-01-01T00:00:00.000Z',
      [{ transactionId: 'GENESIS_TX', type: 'GENESIS', details: 'PDSChain Genesis Block Initialized' }],
      '0000000000000000000000000000000000000000000000000000000000000000',
      0,
      'VERIFIED',
      ['VAL-01', 'VAL-02', 'VAL-03', 'VAL-04', 'VAL-05', 'VAL-06', 'VAL-07', 'VAL-08', 'VAL-09', 'VAL-10', 'VAL-11', 'VAL-12']
    );
    // Mine genesis to satisfy difficulty
    genesis.mineBlock(this.difficulty);
    return genesis;
  }

  getLatestBlock() {
    if (this.chain.length === 0) {
      const genesis = this.createGenesisBlock();
      this.chain.push(genesis);
      return genesis;
    }
    return this.chain[this.chain.length - 1];
  }

  addBlock(transactions, validatorSignatures = []) {
    const latest = this.getLatestBlock();
    const newNumber = latest.blockNumber + 1;
    const timestamp = new Date().toISOString();

    const newBlock = new Block(
      newNumber,
      timestamp,
      transactions,
      latest.blockHash,
      0,
      'VERIFIED',
      validatorSignatures
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    logger.info(`New Block #${newBlock.blockNumber} added to chain. Hash: ${newBlock.blockHash}`);
    return newBlock;
  }

  isChainValid() {
    return validateChain(this.chain).isValid;
  }

  getBlockByNumber(blockNumber) {
    const num = parseInt(blockNumber, 10);
    return this.chain.find(b => b.blockNumber === num) || null;
  }

  getBlockByHash(hash) {
    return this.chain.find(b => b.blockHash === hash) || null;
  }

  getTransactionById(transactionId) {
    for (const block of this.chain) {
      if (Array.isArray(block.transactions)) {
        const found = block.transactions.find(tx => (tx.transactionId === transactionId || tx.id === transactionId));
        if (found) {
          return {
            transaction: found,
            blockNumber: block.blockNumber,
            blockHash: block.blockHash,
            timestamp: block.timestamp,
            consensusStatus: block.consensusStatus
          };
        }
      }
    }
    return null;
  }

  async loadFromDatabase(BlockModel) {
    try {
      if (!BlockModel) return;
      const records = await BlockModel.findAll({ order: [['blockNumber', 'ASC']] });
      if (records && records.length > 0) {
        this.chain = records.map(r => new Block(
          r.blockNumber,
          r.timestamp,
          r.transactions,
          r.previousHash,
          r.nonce,
          r.consensusStatus,
          r.validatorSignatures
        ));
        logger.info(`Loaded ${this.chain.length} blocks from database into memory chain.`);
      } else {
        // Create and persist genesis block
        const genesis = this.createGenesisBlock();
        this.chain = [genesis];
        await BlockModel.create(genesis.toJSON());
        logger.info('Initialized Genesis Block in database.');
      }
    } catch (err) {
      logger.error('Error loading blockchain from DB:', err.message);
      if (this.chain.length === 0) {
        this.chain = [this.createGenesisBlock()];
      }
    }
  }

  toJSON() {
    return {
      chain: this.chain.map(b => b.toJSON()),
      difficulty: this.difficulty,
      length: this.chain.length,
      isValid: this.isChainValid()
    };
  }
}

module.exports = Blockchain;

