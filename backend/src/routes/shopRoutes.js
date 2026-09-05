const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const inventoryController = require('../controllers/inventoryController');
const transactionController = require('../controllers/transactionController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public/authenticated directory
router.get('/', optionalAuthMiddleware, shopController.getAll);
router.get('/:id', optionalAuthMiddleware, shopController.getById);

// Admin-only management
router.post('/', authMiddleware, roleMiddleware('ADMIN'), shopController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), shopController.update);

// Shop inventory
router.get('/:id/inventory', optionalAuthMiddleware, inventoryController.getByShop);
router.post('/:id/inventory', authMiddleware, roleMiddleware('SHOP', 'WAREHOUSE', 'ADMIN'), inventoryController.addOrUpdate);
router.put('/:id/inventory/:commodityId', authMiddleware, roleMiddleware('SHOP', 'WAREHOUSE', 'ADMIN'), inventoryController.addOrUpdate);

// Shop transactions sub-routes
router.get('/:id/transactions', optionalAuthMiddleware, transactionController.getByShop);

module.exports = router;
