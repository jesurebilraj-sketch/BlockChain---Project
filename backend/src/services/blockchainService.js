const Blockchain = require('../blockchain/Blockchain');
const BlockModel = require('../models/Block');
const config = require('../config/env');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.blockchain = new Blockchain(config.BLOCKCHAIN_DIFFICULTY);
  }

  async init() {
    await this.blockchain.loadFromDatabase(BlockModel);
  }

  getChain() {
    return this.blockchain.toJSON();
  }

  getBlocks() {
    return this.blockchain.chain.map(b => b.toJSON());
  }

  getBlockByNumber(number) {
    const block = this.blockchain.getBlockByNumber(number);
    return block ? block.toJSON() : null;
  }

  getTransactionById(transactionId) {
    return this.blockchain.getTransactionById(transactionId);
  }

  validateChain() {
    return {
      isValid: this.blockchain.isChainValid(),
      blockCount: this.blockchain.chain.length,
      latestBlock: this.blockchain.getLatestBlock().toJSON()
    };
  }

  async addBlock(transactions, validatorSignatures = []) {
    // If chain is uninitialized or DB has newer blocks, sync first
    const dbCount = await BlockModel.count();
    if (dbCount > this.blockchain.chain.length) {
      await this.init();
    }

    const newBlock = this.blockchain.addBlock(transactions, validatorSignatures);

    // Persist to database
    await BlockModel.create(newBlock.toJSON());
    logger.info(`Block #${newBlock.blockNumber} persisted to database.`);

    return newBlock.toJSON();
  }
}

const blockchainService = new BlockchainService();

module.exports = blockchainService;
