const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

router.get('/', blockchainController.getBlockchain);
router.get('/blocks', blockchainController.getBlocks);
router.get('/blocks/:number', blockchainController.getBlockByNumber);
router.get('/transactions/:transactionId', blockchainController.getTransactionById);
router.get('/validate', blockchainController.validate);

module.exports = router;

