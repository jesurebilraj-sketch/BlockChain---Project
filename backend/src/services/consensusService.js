const fbaInstance = require('../consensus/FBAConsensus');

class ConsensusService {
  getStatus() {
    return fbaInstance.getNetworkStatus();
  }

  getQuorumDetails() {
    const nodes = fbaInstance.getValidators();
    const networkStatus = fbaInstance.getNetworkStatus();

    const slices = nodes.map(n => ({
      validatorId: n.validatorId,
      name: n.name,
      org: n.org,
      status: n.status,
      trustConfiguration: n.quorumSlice.toJSON()
    }));

    return {
      networkStatus,
      slices,
      recentRounds: fbaInstance.rounds.slice(0, 10)
    };
  }

  async runConsensus(proposal) {
    return await fbaInstance.runConsensusRound(proposal);
  }
}

module.exports = new ConsensusService();

