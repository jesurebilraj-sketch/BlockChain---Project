const QuorumSlice = require('./QuorumSlice');
const crypto = require('crypto');

class ValidatorNode {
  constructor(data) {
    this.validatorId = data.validatorId;
    this.name = data.name;
    this.org = data.org;
    this.publicKey = data.publicKey || `0x${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    this.status = data.status || 'Online'; // Online | Offline | Degraded
    this.blockHeight = data.blockHeight || 4281;
    this.txValidated = data.txValidated || 14280;
    this.participation = data.participation || '100%';

    const trustConfig = data.trustConfiguration || {};
    this.quorumSlice = new QuorumSlice(
      this.validatorId,
      trustConfig.quorumSlice || [],
      trustConfig.threshold || 3
    );

    this.statementHistory = [];
  }

  isOnline() {
    return this.status === 'Online';
  }

  setStatus(status) {
    if (['Online', 'Offline', 'Degraded'].includes(status)) {
      this.status = status;
      return true;
    }
    return false;
  }

  evaluateProposal(proposal) {
    if (!this.isOnline()) {
      return {
        validatorId: this.validatorId,
        vote: 'OFFLINE',
        reason: 'Node is offline',
        signature: null
      };
    }

    // Evaluate basic consistency & business payload
    if (!proposal || !proposal.transactionId) {
      return {
        validatorId: this.validatorId,
        vote: 'REJECT',
        reason: 'Invalid transaction proposal payload',
        signature: null
      };
    }

    if (proposal.quantity <= 0) {
      return {
        validatorId: this.validatorId,
        vote: 'REJECT',
        reason: 'Quantity must be greater than zero',
        signature: null
      };
    }

    // Sign the agreement statement
    const statement = `VOTE:AGREE:${proposal.transactionId}:${this.validatorId}:${Date.now()}`;
    const signature = crypto.createHash('sha256').update(statement + this.publicKey).digest('hex');

    const voteRecord = {
      validatorId: this.validatorId,
      vote: 'AGREE',
      statement,
      signature: `0x${signature.substring(0, 16)}`,
      timestamp: new Date().toISOString()
    };

    this.statementHistory.push(voteRecord);
    this.txValidated++;
    return voteRecord;
  }

  toJSON() {
    return {
      id: this.validatorId,
      validatorId: this.validatorId,
      name: this.name,
      org: this.org,
      publicKey: this.publicKey,
      status: this.status,
      blockHeight: this.blockHeight,
      txValidated: this.txValidated,
      participation: this.participation,
      trustConfiguration: this.quorumSlice.toJSON()
    };
  }
}

module.exports = ValidatorNode;

