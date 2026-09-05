/**
 * QuorumSlice Class
 * Represents a validator's trusted slice of nodes with a threshold requirement.
 * In FBA, a node v considers a slice S satisfied by set U if |S ∩ U| >= threshold.
 */

class QuorumSlice {
  constructor(nodeId, members = [], threshold = 3) {
    this.nodeId = nodeId;
    // Slices must contain the node itself plus trusted peers
    const memberSet = new Set(members);
    if (nodeId) memberSet.add(nodeId);
    this.members = Array.from(memberSet);
    this.threshold = Math.min(threshold, this.members.length);
  }

  isSatisfied(agreeingNodes) {
    const agreeSet = new Set(agreeingNodes);
    let count = 0;
    for (const member of this.members) {
      if (agreeSet.has(member)) {
        count++;
      }
    }
    return count >= this.threshold;
  }

  toJSON() {
    return {
      nodeId: this.nodeId,
      threshold: this.threshold,
      members: this.members
    };
  }
}

module.exports = QuorumSlice;

