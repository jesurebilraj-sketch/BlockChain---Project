const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public/authenticated search and view
router.get('/', optionalAuthMiddleware, beneficiaryController.getAll);
router.get('/:id', optionalAuthMiddleware, beneficiaryController.getById);

// Admin-only operations for creating and modifying citizen records
router.post('/', authMiddleware, roleMiddleware('ADMIN'), beneficiaryController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), beneficiaryController.update);

module.exports = router;
