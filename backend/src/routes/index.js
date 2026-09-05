const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const beneficiaryRoutes = require('./beneficiaryRoutes');
const shopRoutes = require('./shopRoutes');
const warehouseRoutes = require('./warehouseRoutes');
const transactionRoutes = require('./transactionRoutes');
const blockchainRoutes = require('./blockchainRoutes');
const validatorRoutes = require('./validatorRoutes');
const consensusRoutes = require('./consensusRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const Beneficiary = require('../models/Beneficiary');
const Shop = require('../models/Shop');
const Warehouse = require('../models/Warehouse');
const Transaction = require('../models/Transaction');
const blockchainService = require('../services/blockchainService');
const fbaInstance = require('../consensus/FBAConsensus');

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/shops', shopRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/transactions', transactionRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/validators', validatorRoutes);
router.use('/consensus', consensusRoutes);
router.use('/dashboard', dashboardRoutes);

// Health Check API
router.get('/health', (req, res) => {
  const chainValidation = blockchainService.validateChain();
  const network = fbaInstance.getNetworkStatus();

  res.status(200).json({
    success: true,
    service: 'PDSChain Backend API',
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    database: 'connected',
    blockchain: {
      valid: chainValidation.isValid,
      height: chainValidation.blockCount
    },
    consensus: {
      model: 'Federated Byzantine Agreement (FBA)',
      validatorsOnline: `${network.onlineCount} / ${network.totalValidators}`,
      quorumStatus: network.hasQuorum ? 'OPERATIONAL' : 'DEGRADED'
    }
  });
});

// Full Dataset Snapshot (/api/data) for seamless frontend bootstrap
router.get('/data', async (req, res, next) => {
  try {
    const rawBeneficiaries = await Beneficiary.findAll({ order: [['id', 'ASC']] });
    const rawShops = await Shop.findAll({ order: [['id', 'ASC']] });
    const rawWarehouses = await Warehouse.findAll({ order: [['id', 'ASC']] });
    const rawTransactions = await Transaction.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
    const blocks = blockchainService.getBlocks();
    const validators = fbaInstance.getValidators().map(v => v.toJSON());

    const beneficiaries = rawBeneficiaries.map(b => ({
      id: b.beneficiaryId,
      name: b.name,
      region: b.region,
      household: b.household,
      quotaRice: b.monthlyEntitlement?.Rice || 20,
      quotaWheat: b.monthlyEntitlement?.Wheat || 10,
      quotaSugar: b.monthlyEntitlement?.Sugar || 2,
      quotaPulses: b.monthlyEntitlement?.Pulses || 2,
      status: b.status,
      lastDist: b.lastDist || 'None'
    }));

    const shops = rawShops.map(s => ({
      id: s.shopId,
      name: s.name,
      region: s.region,
      manager: s.manager,
      beneficiaries: s.beneficiariesCount,
      stockHealth: s.stockHealth,
      status: s.status
    }));

    const warehouses = rawWarehouses.map(w => ({
      id: w.warehouseId,
      name: w.name,
      location: w.location,
      capacity: w.capacity,
      currentStock: w.currentStock,
      utilization: w.utilization,
      status: w.status
    }));

    const transactions = rawTransactions.map(t => ({
      id: t.transactionId,
      beneficiary: t.beneficiaryId,
      name: t.beneficiaryName,
      shop: t.shopId,
      commodity: t.commodity,
      qty: `${t.quantity} ${t.unit || 'KG'}`,
      block: t.blockNumber ? `#${t.blockNumber}` : 'Pending',
      validators: t.fbaValidators,
      hash: t.hash || t.blockHash || '',
      status: t.status,
      time: t.timestamp
    }));

    res.status(200).json({
      beneficiaries,
      shops,
      warehouses,
      transactions,
      validators,
      blocks
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

