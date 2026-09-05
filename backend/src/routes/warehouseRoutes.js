const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, warehouseController.getAll);
router.get('/:id', optionalAuthMiddleware, warehouseController.getById);
router.post('/', optionalAuthMiddleware, warehouseController.create);
router.put('/:id', optionalAuthMiddleware, warehouseController.update);

module.exports = router;

