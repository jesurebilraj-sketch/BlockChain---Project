const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public/authenticated validator directory
router.get('/', optionalAuthMiddleware, validatorController.getAll);
router.get('/:id', optionalAuthMiddleware, validatorController.getById);

// Protected: Only Validator or Admin can toggle status for fault simulation
router.post('/:id/status', authMiddleware, roleMiddleware('VALIDATOR', 'ADMIN'), validatorController.updateStatus);
router.put('/:id/status', authMiddleware, roleMiddleware('VALIDATOR', 'ADMIN'), validatorController.updateStatus);

module.exports = router;
