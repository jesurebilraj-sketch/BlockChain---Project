const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, validatorController.getAll);
router.get('/:id', optionalAuthMiddleware, validatorController.getById);
router.post('/:id/status', optionalAuthMiddleware, validatorController.updateStatus);
router.put('/:id/status', optionalAuthMiddleware, validatorController.updateStatus);

module.exports = router;

