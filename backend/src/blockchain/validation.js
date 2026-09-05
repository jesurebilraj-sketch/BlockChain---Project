function validateBlock(block, previousBlock) {
  if (!block) return { valid: false, reason: 'Block is null or undefined' };

  if (!block.isValid()) {
    return { valid: false, reason: `Block #${block.blockNumber} hash or Merkle root does not match contents` };
  }

  if (previousBlock) {
    if (block.blockNumber !== previousBlock.blockNumber + 1) {
      return { valid: false, reason: `Block #${block.blockNumber} sequence broken: expected ${previousBlock.blockNumber + 1}` };
    }
    if (block.previousHash !== previousBlock.blockHash) {
      return { valid: false, reason: `Block #${block.blockNumber} previousHash does not match Block #${previousBlock.blockNumber} hash` };
    }
  } else {
    // Genesis block check
    if (block.blockNumber !== 0 && block.blockNumber !== 1) {
      // In PDSChain, block 0 is Genesis
      if (block.previousHash !== '0' && block.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return { valid: false, reason: `Genesis block has invalid previousHash: ${block.previousHash}` };
      }
    }
  }

  return { valid: true };
}

function validateChain(chain) {
  if (!Array.isArray(chain) || chain.length === 0) {
    return { isValid: false, reason: 'Chain is empty or not an array' };
  }

  // Validate genesis block
  const genesis = chain[0];
  const genesisCheck = validateBlock(genesis, null);
  if (!genesisCheck.valid) {
    return { isValid: false, reason: genesisCheck.reason };
  }

  // Validate consecutive blocks
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    const result = validateBlock(currentBlock, previousBlock);
    if (!result.valid) {
      return { isValid: false, reason: result.reason, brokenBlockIndex: i };
    }
  }

  return { isValid: true, blockCount: chain.length };
}

module.exports = {
  validateBlock,
  validateChain
};

