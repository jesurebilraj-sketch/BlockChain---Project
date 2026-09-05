const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, transactionController.getAll);
router.get('/:id', optionalAuthMiddleware, transactionController.getById);
router.post('/', optionalAuthMiddleware, transactionController.create);

module.exports = router;

