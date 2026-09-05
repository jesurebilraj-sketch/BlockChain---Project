const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public/authenticated directory
router.get('/', optionalAuthMiddleware, warehouseController.getAll);
router.get('/:id', optionalAuthMiddleware, warehouseController.getById);

// Admin-only creation/updating
router.post('/', authMiddleware, roleMiddleware('ADMIN'), warehouseController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), warehouseController.update);

// Warehouse-to-shop stock transfer
router.post('/:id/transfer', authMiddleware, roleMiddleware('WAREHOUSE', 'ADMIN'), warehouseController.transferStock);

module.exports = router;
