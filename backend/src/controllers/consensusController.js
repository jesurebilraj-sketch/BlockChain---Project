const consensusService = require('../services/consensusService');

class ConsensusController {
  getStatus(req, res) {
    const status = consensusService.getStatus();
    res.status(200).json({
      success: true,
      consensus: status
    });
  }

  getQuorum(req, res) {
    const quorum = consensusService.getQuorumDetails();
    res.status(200).json({
      success: true,
      ...quorum
    });
  }

  async propose(req, res, next) {
    try {
      const proposal = req.body;
      const result = await consensusService.runConsensus(proposal);
      res.status(200).json({
        success: true,
        result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ConsensusController();

