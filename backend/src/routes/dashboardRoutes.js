const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/admin', optionalAuthMiddleware, dashboardController.getAdminDashboard);
router.get('/shop', optionalAuthMiddleware, dashboardController.getShopDashboard);
router.get('/warehouse', optionalAuthMiddleware, dashboardController.getWarehouseDashboard);
router.get('/citizen', optionalAuthMiddleware, dashboardController.getCitizenDashboard);
router.get('/validator', optionalAuthMiddleware, dashboardController.getValidatorDashboard);

module.exports = router;

