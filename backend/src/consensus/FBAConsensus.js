const ValidatorNode = require('./ValidatorNode');
const { DEFAULT_12_VALIDATORS } = require('./consensusConfig');
const { findQuorum, evaluateNetworkQuorum } = require('./Quorum');
const logger = require('../utils/logger');

class FBAConsensus {
  constructor() {
    this.validators = new Map();
    this.initDefaultValidators();
    this.rounds = [];
  }

  initDefaultValidators() {
    this.validators.clear();
    for (const vData of DEFAULT_12_VALIDATORS) {
      const node = new ValidatorNode(vData);
      this.validators.set(node.validatorId, node);
    }
  }

  loadValidatorsFromDB(validatorRecords) {
    if (!validatorRecords || validatorRecords.length === 0) return;
    this.validators.clear();
    for (const r of validatorRecords) {
      const node = new ValidatorNode({
        validatorId: r.validatorId,
        name: r.name,
        org: r.org,
        publicKey: r.publicKey,
        status: r.status,
        blockHeight: r.blockHeight,
        txValidated: r.txValidated,
        participation: r.participation,
        trustConfiguration: r.trustConfiguration
      });
      this.validators.set(node.validatorId, node);
    }
    logger.consensus(`Loaded ${this.validators.size} validators into FBA consensus engine.`);
  }

  getValidators() {
    return Array.from(this.validators.values());
  }

  getValidator(id) {
    return this.validators.get(id) || null;
  }

  setValidatorStatus(id, status) {
    const node = this.validators.get(id);
    if (!node) return false;
    const ok = node.setStatus(status);
    if (ok) {
      logger.consensus(`Validator ${id} status updated to: ${status}`);
    }
    return ok;
  }

  getNetworkStatus() {
    const nodes = this.getValidators();
    return evaluateNetworkQuorum(nodes);
  }

  /**
   * Execute a full FBA Consensus Round for a transaction proposal.
   */
  async runConsensusRound(proposal) {
    const roundId = `RND-${Date.now().toString().slice(-6)}`;
    const startTime = Date.now();
    const nodes = this.getValidators();
    const votes = [];
    const agreeingNodes = [];
    const validatorSignatures = [];

    // 1. Proposal & Statement Collection
    for (const node of nodes) {
      const voteResult = node.evaluateProposal(proposal);
      votes.push(voteResult);

      if (voteResult.vote === 'AGREE') {
        agreeingNodes.push(node.validatorId);
        validatorSignatures.push({
          validatorId: node.validatorId,
          signature: voteResult.signature,
          timestamp: voteResult.timestamp
        });
      }
    }

    // 2. Evaluate Quorum Slices against Agreeing Nodes
    const quorumResult = findQuorum(agreeingNodes, this.validators);
    const latencyMs = Date.now() - startTime;
    const isSuccess = quorumResult.isQuorum && quorumResult.quorumSize >= 9; // >= 75% quorum requirement

    const roundSummary = {
      roundId,
      transactionId: proposal.transactionId,
      timestamp: new Date().toISOString(),
      latencyMs: Math.max(latencyMs, 12),
      totalValidators: nodes.length,
      participatingValidators: agreeingNodes.length,
      agreeingValidators: agreeingNodes,
      quorumAchieved: quorumResult.isQuorum,
      quorumMembers: quorumResult.quorumMembers,
      quorumSize: quorumResult.quorumSize,
      status: isSuccess ? 'ACHIEVED' : 'FAILED',
      validatorSignatures,
      votes
    };

    this.rounds.unshift(roundSummary);
    if (this.rounds.length > 50) this.rounds.pop(); // Keep recent 50 rounds

    logger.consensus(`Round ${roundId} for ${proposal.transactionId} -> Status: ${roundSummary.status} (Quorum: ${roundSummary.quorumSize}/${nodes.length})`);
    return roundSummary;
  }
}

// Singleton consensus coordinator
const fbaInstance = new FBAConsensus();

module.exports = fbaInstance;

