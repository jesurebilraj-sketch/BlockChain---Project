const blockchainService = require('../services/blockchainService');
const { NotFoundError } = require('../utils/errors');

class BlockchainController {
  getBlockchain(req, res) {
    const chainData = blockchainService.getChain();
    res.status(200).json({
      success: true,
      ...chainData
    });
  }

  getBlocks(req, res) {
    const blocks = blockchainService.getBlocks();
    res.status(200).json({
      success: true,
      count: blocks.length,
      blocks
    });
  }

  getBlockByNumber(req, res, next) {
    try {
      const number = req.params.number;
      const block = blockchainService.getBlockByNumber(number);
      if (!block) {
        throw new NotFoundError(`Block #${number} not found.`);
      }

      res.status(200).json({
        success: true,
        block
      });
    } catch (err) {
      next(err);
    }
  }

  getTransactionById(req, res, next) {
    try {
      const txId = req.params.transactionId;
      const result = blockchainService.getTransactionById(txId);
      if (!result) {
        throw new NotFoundError(`Transaction '${txId}' not found on blockchain.`);
      }

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  validate(req, res) {
    const validation = blockchainService.validateChain();
    res.status(200).json({
      success: true,
      ...validation
    });
  }
}

module.exports = new BlockchainController();

