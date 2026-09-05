/**
 * Quorum Calculation and Verification
 * In FBA:
 * Set U is a quorum if:
 * 1. U is non-empty.
 * 2. For every node v in U, U satisfies v's quorum slice (i.e. |Slice(v) ∩ U| >= threshold(v)).
 */

function findQuorum(agreeingNodes, validatorMap) {
  let U = new Set(agreeingNodes);

  let changed = true;
  while (changed) {
    changed = false;
    for (const nodeId of Array.from(U)) {
      const node = validatorMap.get(nodeId);
      if (!node || !node.isOnline() || !node.quorumSlice.isSatisfied(Array.from(U))) {
        // Node v cannot have its slice satisfied within current candidate set U, so remove it
        U.delete(nodeId);
        changed = true;
      }
    }
  }

  return {
    isQuorum: U.size > 0,
    quorumMembers: Array.from(U),
    quorumSize: U.size
  };
}

function evaluateNetworkQuorum(validatorNodes) {
  const validatorMap = new Map();
  const onlineNodes = [];

  for (const v of validatorNodes) {
    validatorMap.set(v.validatorId, v);
    if (v.isOnline()) {
      onlineNodes.push(v.validatorId);
    }
  }

  const quorumResult = findQuorum(onlineNodes, validatorMap);

  return {
    totalValidators: validatorNodes.length,
    onlineCount: onlineNodes.length,
    offlineCount: validatorNodes.length - onlineNodes.length,
    hasQuorum: quorumResult.isQuorum,
    quorumMembers: quorumResult.quorumMembers,
    quorumPercentage: Math.round((quorumResult.quorumSize / validatorNodes.length) * 100)
  };
}

module.exports = {
  findQuorum,
  evaluateNetworkQuorum
};

