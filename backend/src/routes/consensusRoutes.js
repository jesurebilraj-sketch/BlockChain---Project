const express = require('express');
const router = express.Router();
const consensusController = require('../controllers/consensusController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/status', consensusController.getStatus);
router.get('/quorum', consensusController.getQuorum);
router.post('/propose', optionalAuthMiddleware, consensusController.propose);

module.exports = router;

