const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const QuorumSlice = require('../consensus/QuorumSlice');

function createValidatorApp(validatorConfig) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const state = {
    validatorId: validatorConfig.validatorId,
    name: validatorConfig.name,
    org: validatorConfig.org,
    port: validatorConfig.port,
    publicKey: validatorConfig.publicKey || `0x${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    status: validatorConfig.status || 'Online',
    blockHeight: validatorConfig.blockHeight || 4281,
    txValidated: validatorConfig.txValidated || 14280,
    participation: validatorConfig.participation || '100%',
    quorumSlice: new QuorumSlice(
      validatorConfig.validatorId,
      validatorConfig.trustConfiguration?.quorumSlice || [],
      validatorConfig.trustConfiguration?.threshold || 3
    ),
    statements: []
  };

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      validatorId: state.validatorId,
      nodeStatus: state.status,
      port: state.port,
      uptime: process.uptime()
    });
  });

  // Node Status & Quorum Slice
  app.get('/status', (req, res) => {
    res.json({
      validatorId: state.validatorId,
      name: state.name,
      org: state.org,
      publicKey: state.publicKey,
      status: state.status,
      port: state.port,
      blockHeight: state.blockHeight,
      txValidated: state.txValidated,
      participation: state.participation,
      trustConfiguration: state.quorumSlice.toJSON()
    });
  });

  // Toggle Node Status (for failure & recovery simulation)
  app.post('/status', (req, res) => {
    const { status } = req.body;
    if (['Online', 'Offline', 'Degraded'].includes(status)) {
      state.status = status;
      return res.json({
        success: true,
        validatorId: state.validatorId,
        status: state.status
      });
    }
    res.status(400).json({ success: false, message: 'Invalid status' });
  });

  // Evaluate Transaction / Block Proposal
  app.post('/proposal', (req, res) => {
    const proposal = req.body;

    if (state.status !== 'Online') {
      return res.json({
        validatorId: state.validatorId,
        vote: 'OFFLINE',
        reason: 'Validator node is offline',
        signature: null
      });
    }

    if (!proposal || !proposal.transactionId) {
      return res.status(400).json({
        validatorId: state.validatorId,
        vote: 'REJECT',
        reason: 'Malformed proposal payload',
        signature: null
      });
    }

    if (proposal.quantity && parseFloat(proposal.quantity) <= 0) {
      return res.json({
        validatorId: state.validatorId,
        vote: 'REJECT',
        reason: 'Quantity must be positive',
        signature: null
      });
    }

    // Cryptographically sign statement
    const statement = `VOTE:AGREE:${proposal.transactionId}:${state.validatorId}:${Date.now()}`;
    const signature = crypto.createHash('sha256').update(statement + state.publicKey).digest('hex');

    const voteRecord = {
      validatorId: state.validatorId,
      vote: 'AGREE',
      statement,
      signature: `0x${signature.substring(0, 16)}`,
      timestamp: new Date().toISOString()
    };

    state.statements.push(voteRecord);
    state.txValidated++;

    res.json(voteRecord);
  });

  // Peer Vote Propagation
  app.post('/vote', (req, res) => {
    const { peerVotes } = req.body;
    const agreeingList = (peerVotes || []).filter(v => v.vote === 'AGREE').map(v => v.validatorId);
    const sliceSatisfied = state.quorumSlice.isSatisfied(agreeingList);

    res.json({
      validatorId: state.validatorId,
      sliceSatisfied,
      threshold: state.quorumSlice.threshold,
      peerAgreementsCount: agreeingList.length
    });
  });

  // Chain state synchronization
  app.get('/chain', (req, res) => {
    res.json({
      validatorId: state.validatorId,
      blockHeight: state.blockHeight,
      lastSync: new Date().toISOString()
    });
  });

  return { app, state };
}

module.exports = {
  createValidatorApp
};

