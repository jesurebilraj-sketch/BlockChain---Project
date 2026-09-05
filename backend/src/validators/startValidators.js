const { DEFAULT_12_VALIDATORS } = require('../consensus/consensusConfig');
const { createValidatorApp } = require('./validatorServer');
const logger = require('../utils/logger');

const runningServers = [];

function startAllValidators() {
  logger.info('Starting 12 Independent FBA Validator Nodes...');

  DEFAULT_12_VALIDATORS.forEach((vConfig) => {
    const { app, state } = createValidatorApp(vConfig);
    const server = app.listen(vConfig.port, () => {
      logger.info(`[VALIDATOR-NODE] ${state.validatorId} (${state.name}) online on port ${vConfig.port} -> ${vConfig.endpoint}`);
    });
    runningServers.push({ validatorId: vConfig.validatorId, port: vConfig.port, server });
  });

  logger.info('All 12 FBA Validator Node HTTP processes launched successfully!');
  return runningServers;
}

function stopAllValidators() {
  runningServers.forEach(({ server }) => {
    try {
      server.close();
    } catch (e) {}
  });
  runningServers.length = 0;
  logger.info('All 12 FBA Validator Nodes stopped.');
}

if (require.main === module) {
  startAllValidators();

  process.on('SIGINT', () => {
    logger.info('Shutting down validator nodes...');
    stopAllValidators();
    process.exit(0);
  });
}

module.exports = {
  startAllValidators,
  stopAllValidators
};

