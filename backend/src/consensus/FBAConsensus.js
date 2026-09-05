const ValidatorNode = require('./ValidatorNode');
const { DEFAULT_12_VALIDATORS } = require('./consensusConfig');
const { findQuorum, evaluateNetworkQuorum } = require('./Quorum');
const logger = require('../utils/logger');
const http = require('http');

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
   * Helper to query validator over HTTP with fallback to local in-process evaluation
   */
  async queryValidatorNodeHTTP(node, proposal) {
    const port = 4000 + parseInt(node.validatorId.replace('VAL-', ''), 10);
    const postData = JSON.stringify(proposal);

    return new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path: '/proposal',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 200
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve(node.evaluateProposal(proposal));
          }
        });
      });

      req.on('error', () => {
        // Fallback to in-process evaluation
        resolve(node.evaluateProposal(proposal));
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(node.evaluateProposal(proposal));
      });

      req.write(postData);
      req.end();
    });
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

    // 1. Proposal & Statement Collection (HTTP with in-process fallback)
    for (const node of nodes) {
      let voteResult;
      if (!node.isOnline()) {
        voteResult = {
          validatorId: node.validatorId,
          vote: 'OFFLINE',
          reason: 'Node is offline',
          signature: null
        };
      } else {
        voteResult = await this.queryValidatorNodeHTTP(node, proposal);
      }

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
