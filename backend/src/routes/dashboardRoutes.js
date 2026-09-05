const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role-protected dashboard routes
router.get('/admin', authMiddleware, roleMiddleware('ADMIN'), dashboardController.getAdminDashboard);
router.get('/shop', authMiddleware, roleMiddleware('SHOP', 'ADMIN'), dashboardController.getShopDashboard);
router.get('/warehouse', authMiddleware, roleMiddleware('WAREHOUSE', 'ADMIN'), dashboardController.getWarehouseDashboard);
router.get('/citizen', authMiddleware, roleMiddleware('CITIZEN', 'ADMIN'), dashboardController.getCitizenDashboard);
router.get('/validator', authMiddleware, roleMiddleware('VALIDATOR', 'ADMIN'), dashboardController.getValidatorDashboard);

module.exports = router;
