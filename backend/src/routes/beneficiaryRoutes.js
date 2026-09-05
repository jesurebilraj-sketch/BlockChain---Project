const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, beneficiaryController.getAll);
router.get('/:id', optionalAuthMiddleware, beneficiaryController.getById);
router.post('/', optionalAuthMiddleware, beneficiaryController.create);
router.put('/:id', optionalAuthMiddleware, beneficiaryController.update);

module.exports = router;

