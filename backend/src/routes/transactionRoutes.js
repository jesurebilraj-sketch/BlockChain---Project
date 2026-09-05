const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public/authenticated queries
router.get('/', optionalAuthMiddleware, transactionController.getAll);
router.get('/:id', optionalAuthMiddleware, transactionController.getById);

// Protected: Only Fair Price Shop Officers and Admins can distribute ration and create on-chain transactions
router.post('/', authMiddleware, roleMiddleware('SHOP', 'ADMIN'), transactionController.create);

module.exports = router;
