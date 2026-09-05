const Transaction = require('../models/Transaction');
const entitlementService = require('./entitlementService');
const inventoryService = require('./inventoryService');
const consensusService = require('./consensusService');
const blockchainService = require('./blockchainService');
const { generateTransactionId } = require('../utils/ids');
const { validateTransactionPayload } = require('../validators/schemas');
const { ConflictError, ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');
const crypto = require('crypto');

class TransactionService {
  async getAllTransactions(limit = 100) {
    return await Transaction.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10) || 100
    });
  }

  async getTransactionById(transactionId) {
    const tx = await Transaction.findOne({
      where: { transactionId }
    });
    if (!tx) {
      throw new NotFoundError(`Transaction '${transactionId}' not found.`);
    }
    return tx;
  }

  async getTransactionsByBeneficiary(beneficiaryId) {
    return await Transaction.findAll({
      where: { beneficiaryId },
      order: [['createdAt', 'DESC']]
    });
  }

  async getTransactionsByShop(shopId) {
    return await Transaction.findAll({
      where: { shopId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Process a complete PDS Grain Distribution Transaction through FBA Consensus & Blockchain.
   */
  async processDistribution(payload, user = null) {
    const validData = validateTransactionPayload(payload);
    const { beneficiaryId, shopId, commodity, quantity } = validData;

    // 1. Check duplicate transactions within the last 10 seconds for the same beneficiary & commodity
    const recentDuplicate = await Transaction.findOne({
      where: {
        beneficiaryId,
        commodity,
        quantity,
        status: 'Verified'
      },
      order: [['createdAt', 'DESC']]
    });

    if (recentDuplicate) {
      const diffMs = Date.now() - new Date(recentDuplicate.createdAt).getTime();
      if (diffMs < 5000) { // 5 seconds debounce protection
        throw new ConflictError('Duplicate transaction detected. Please wait before submitting another identical request.');
      }
    }

    // 2. Validate Entitlement Quota
    const quotaCheck = await entitlementService.checkEligibilityAndQuota(beneficiaryId, commodity, quantity);
    const beneficiary = quotaCheck.beneficiary;

    // 3. Validate Shop Inventory
    await inventoryService.checkShopStock(shopId, commodity, quantity);

    // 4. Generate Unique Transaction ID & Timestamp
    const transactionId = generateTransactionId();
    const timestamp = new Date().toISOString();
    const citizenName = validData.name || beneficiary.name || 'Citizen';

    // 5. Create Proposal for 12-Validator FBA Network
    const proposal = {
      transactionId,
      beneficiaryId,
      beneficiaryName: citizenName,
      shopId,
      commodity,
      quantity,
      timestamp
    };

    logger.info(`Initiating FBA Consensus for Transaction ${transactionId} (Citizen: ${beneficiaryId}, Qty: ${quantity} ${commodity})...`);

    // 6. Run FBA Consensus Round
    const consensusResult = await consensusService.runConsensus(proposal);

    if (consensusResult.status !== 'ACHIEVED') {
      // Consensus Failed
      const rejectedTx = await Transaction.create({
        transactionId,
        beneficiaryId,
        beneficiaryName: citizenName,
        shopId,
        commodity,
        quantity,
        timestamp,
        status: 'Rejected',
        fbaValidators: consensusResult.participatingValidators,
        fbaConsensus: false,
        remarks: 'Failed FBA validator quorum agreement'
      });

      return {
        success: false,
        message: 'Transaction rejected by validator quorum consensus.',
        transaction: rejectedTx,
        consensus: consensusResult
      };
    }

    // 7. Consensus Achieved -> Add to Blockchain
    const txContentForBlock = {
      transactionId,
      beneficiaryId,
      name: citizenName,
      shopId,
      commodity,
      quantity: `${quantity} KG`,
      timestamp,
      consensusRound: consensusResult.roundId,
      validators: consensusResult.participatingValidators
    };

    const newBlock = await blockchainService.addBlock([txContentForBlock], consensusResult.validatorSignatures);

    // Calculate Cryptographic Transaction Hash
    const txHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(txContentForBlock) + newBlock.blockHash).digest('hex').substring(0, 16);

    // 8. Atomically Deduct Entitlement Quota & Inventory Stock
    await entitlementService.deductQuota(beneficiaryId, commodity, quantity);
    await inventoryService.deductShopStock(shopId, commodity, quantity);

    // 9. Persist Verified Transaction Record
    const verifiedTx = await Transaction.create({
      transactionId,
      beneficiaryId,
      beneficiaryName: citizenName,
      shopId,
      commodity,
      quantity,
      timestamp,
      status: 'Verified',
      blockNumber: newBlock.blockNumber,
      blockHash: newBlock.blockHash,
      hash: txHash,
      fbaValidators: consensusResult.participatingValidators,
      fbaConsensus: true,
      remarks: 'Verified via 12-Validator FBA Quorum Consensus'
    });

    logger.info(`Transaction ${transactionId} VERIFIED and sealed on Block #${newBlock.blockNumber}`);

    return {
      success: true,
      message: 'Transaction successfully verified through FBA consensus and anchored to blockchain ledger.',
      transaction: {
        ...verifiedTx.toJSON(),
        id: verifiedTx.transactionId,
        block: `#${newBlock.blockNumber}`,
        qty: `${quantity} KG`,
        time: verifiedTx.timestamp
      },
      block: newBlock,
      consensus: {
        status: consensusResult.status,
        roundId: consensusResult.roundId,
        participatingValidators: consensusResult.participatingValidators,
        quorumAchieved: consensusResult.quorumAchieved,
        quorumSize: consensusResult.quorumSize,
        latencyMs: consensusResult.latencyMs
      },
      receipt: {
        receiptNumber: `REC-${transactionId.replace('TXN-', '')}`,
        beneficiaryId,
        beneficiaryName: citizenName,
        shopId,
        commodity,
        quantity: `${quantity} KG`,
        amountPayable: '₹ 0.00 (Subsidized)',
        blockNumber: newBlock.blockNumber,
        blockHash: newBlock.blockHash,
        transactionHash: txHash,
        timestamp,
        verificationStatus: 'CRYPTOGRAPHICALLY_VERIFIED_ON_CHAIN'
      }
    };
  }
}

module.exports = new TransactionService();

