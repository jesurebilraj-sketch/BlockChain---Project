const app = require('./app');
const config = require('./config/env');
const { sequelize, testConnection } = require('./config/database');
const blockchainService = require('./services/blockchainService');
const fbaInstance = require('./consensus/FBAConsensus');
const Validator = require('./models/Validator');
const logger = require('./utils/logger');
const { autoSeedIfEmpty } = require('./seed/seedDatabase');

let server;

async function startServer() {
  try {
    logger.info('Initializing PDSChain backend...');

    // 1. Authenticate & Sync Database
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed. Check configuration.');
    }
    await sequelize.sync({ alter: false });
    logger.info('Database synchronized successfully.');

    // 2. Auto-seed if database is freshly created
    await autoSeedIfEmpty();

    // 3. Initialize Blockchain & load blocks
    await blockchainService.init();

    // 4. Load Validators from DB into FBA Consensus Engine
    const validatorRecords = await Validator.findAll({ order: [['id', 'ASC']] });
    fbaInstance.loadValidatorsFromDB(validatorRecords);

    // 5. Start listening
    server = app.listen(config.PORT, () => {
      logger.info(`==========================================================`);
      logger.info(` PDSChain Backend Server Running at http://localhost:${config.PORT}`);
      logger.info(` Environment: ${config.NODE_ENV}`);
      logger.info(` Consensus Engine: 12-Validator Federated Byzantine Agreement`);
      logger.info(` Blockchain Height: #${blockchainService.blockchain.chain.length}`);
      logger.info(` Health Check: http://localhost:${config.PORT}/api/health`);
      logger.info(`==========================================================`);
    });

    return server;
  } catch (err) {
    logger.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = {
  app,
  startServer
};

