const express = require('express');
const router = express.Router();
const consensusController = require('../controllers/consensusController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/status', optionalAuthMiddleware, consensusController.getStatus);
router.get('/quorum', optionalAuthMiddleware, consensusController.getQuorum);
router.post('/propose', authMiddleware, roleMiddleware('SHOP', 'ADMIN', 'VALIDATOR'), consensusController.propose);

module.exports = router;
