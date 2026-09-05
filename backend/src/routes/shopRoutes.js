const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const inventoryController = require('../controllers/inventoryController');
const transactionController = require('../controllers/transactionController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, shopController.getAll);
router.get('/:id', optionalAuthMiddleware, shopController.getById);
router.post('/', optionalAuthMiddleware, shopController.create);
router.put('/:id', optionalAuthMiddleware, shopController.update);

// Shop inventory sub-routes
router.get('/:id/inventory', optionalAuthMiddleware, inventoryController.getByShop);
router.post('/:id/inventory', optionalAuthMiddleware, inventoryController.addOrUpdate);
router.put('/:id/inventory/:commodityId', optionalAuthMiddleware, inventoryController.addOrUpdate);

// Shop transactions sub-routes
router.get('/:id/transactions', optionalAuthMiddleware, transactionController.getByShop);

module.exports = router;

