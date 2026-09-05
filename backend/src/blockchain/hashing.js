const crypto = require('crypto');

function sha256(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

function calculateMerkleRoot(transactions) {
  if (!transactions || transactions.length === 0) {
    return sha256('EMPTY_TX_POOL');
  }

  let hashes = transactions.map(tx => {
    if (typeof tx === 'string') return sha256(tx);
    // Deterministic string representation of transaction
    const txContent = `${tx.transactionId || tx.id || ''}:${tx.beneficiaryId || tx.beneficiary || ''}:${tx.shopId || tx.shop || ''}:${tx.commodity || ''}:${tx.quantity || tx.qty || ''}:${tx.timestamp || tx.time || ''}`;
    return sha256(txContent);
  });

  while (hashes.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        nextLevel.push(sha256(hashes[i] + hashes[i + 1]));
      } else {
        nextLevel.push(sha256(hashes[i] + hashes[i])); // Duplicate last element if odd
      }
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

module.exports = {
  sha256,
  calculateMerkleRoot
};

