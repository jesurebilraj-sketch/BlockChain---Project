const Beneficiary = require('../models/Beneficiary');
const Shop = require('../models/Shop');
const Warehouse = require('../models/Warehouse');
const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const blockchainService = require('../services/blockchainService');
const fbaInstance = require('../consensus/FBAConsensus');

class DashboardController {
  async getAdminDashboard(req, res, next) {
    try {
      const beneficiariesCount = await Beneficiary.count();
      const shopsCount = await Shop.count();
      const warehousesCount = await Warehouse.count();
      const transactionsCount = await Transaction.count();
      const chainData = blockchainService.getChain();
      const networkStatus = fbaInstance.getNetworkStatus();
      const recentTransactions = await Transaction.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        stats: {
          totalBeneficiaries: beneficiariesCount,
          totalShops: shopsCount,
          totalWarehouses: warehousesCount,
          totalTransactions: transactionsCount,
          blockHeight: chainData.length,
          activeValidators: `${networkStatus.onlineCount} / ${networkStatus.totalValidators}`,
          consensusHealth: networkStatus.hasQuorum ? '100% Operational' : 'Degraded'
        },
        recentTransactions,
        networkStatus
      });
    } catch (err) {
      next(err);
    }
  }

  async getShopDashboard(req, res, next) {
    try {
      const shopId = req.query.shopId || (req.user ? req.user.entityId : 'FPS-102') || 'FPS-102';
      const shop = await Shop.findOne({ where: { shopId } });
      const inventory = await Inventory.findAll({ where: { ownerType: 'SHOP', ownerId: shopId } });
      const transactions = await Transaction.findAll({
        where: { shopId },
        limit: 10,
        order: [['createdAt', 'DESC']]
      });
      const networkStatus = fbaInstance.getNetworkStatus();

      res.status(200).json({
        success: true,
        shopId,
        shop,
        inventory,
        transactions,
        networkStatus
      });
    } catch (err) {
      next(err);
    }
  }

  async getWarehouseDashboard(req, res, next) {
    try {
      const warehouseId = req.query.warehouseId || (req.user ? req.user.entityId : 'WH-003') || 'WH-003';
      const warehouse = await Warehouse.findOne({ where: { warehouseId } });
      const inventory = await Inventory.findAll({ where: { ownerType: 'WAREHOUSE', ownerId: warehouseId } });
      const recentDispatches = await Transaction.findAll({ limit: 8, order: [['createdAt', 'DESC']] });

      res.status(200).json({
        success: true,
        warehouseId,
        warehouse,
        inventory,
        recentDispatches
      });
    } catch (err) {
      next(err);
    }
  }

  async getCitizenDashboard(req, res, next) {
    try {
      const beneficiaryId = req.query.beneficiaryId || (req.user ? req.user.entityId : 'BEN-1024') || 'BEN-1024';
      const beneficiary = await Beneficiary.findOne({ where: { beneficiaryId } });
      const transactions = await Transaction.findAll({
        where: { beneficiaryId },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        beneficiaryId,
        beneficiary,
        transactions
      });
    } catch (err) {
      next(err);
    }
  }

  async getValidatorDashboard(req, res, next) {
    try {
      const validatorId = req.query.validatorId || (req.user ? req.user.entityId : 'VAL-07') || 'VAL-07';
      const validator = fbaInstance.getValidator(validatorId);
      const networkStatus = fbaInstance.getNetworkStatus();
      const allValidators = fbaInstance.getValidators().map(v => v.toJSON());
      const recentRounds = fbaInstance.rounds.slice(0, 10);

      res.status(200).json({
        success: true,
        validatorId,
        validator: validator ? validator.toJSON() : null,
        networkStatus,
        allValidators,
        recentRounds
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();

