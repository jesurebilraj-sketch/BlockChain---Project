const { sha256, calculateMerkleRoot } = require('./hashing');

class Block {
  constructor(blockNumber, timestamp, transactions = [], previousHash = '', nonce = 0, consensusStatus = 'VERIFIED', validatorSignatures = []) {
    this.blockNumber = parseInt(blockNumber, 10);
    this.timestamp = timestamp || new Date().toISOString();
    this.transactions = Array.isArray(transactions) ? transactions : [transactions];
    this.previousHash = previousHash;
    this.nonce = parseInt(nonce, 10) || 0;
    this.consensusStatus = consensusStatus || 'VERIFIED';
    this.validatorSignatures = Array.isArray(validatorSignatures) ? validatorSignatures : [];
    this.merkleRoot = calculateMerkleRoot(this.transactions);
    this.blockHash = this.calculateHash();
  }

  calculateHash() {
    const content = `${this.blockNumber}${this.previousHash}${this.timestamp}${this.merkleRoot}${this.nonce}${this.consensusStatus}`;
    return sha256(content);
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.blockHash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.blockHash = this.calculateHash();
    }
    return this.blockHash;
  }

  isValid() {
    if (this.blockHash !== this.calculateHash()) {
      return false;
    }
    if (this.merkleRoot !== calculateMerkleRoot(this.transactions)) {
      return false;
    }
    return true;
  }

  toJSON() {
    return {
      blockNumber: this.blockNumber,
      blockHash: this.blockHash,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      txCount: this.transactions.length,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot,
      consensusStatus: this.consensusStatus,
      validatorSignatures: this.validatorSignatures,
      // Compatibility aliases for frontend
      number: this.blockNumber,
      hash: this.blockHash,
      prevHash: this.previousHash,
      txns: this.transactions.length,
      validators: this.validatorSignatures.length || 12,
      status: this.consensusStatus
    };
  }
}

module.exports = Block;

