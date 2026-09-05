const { sequelize } = require('../src/config/database');
const { seedDatabase } = require('../src/seed/seedDatabase');
const transactionService = require('../src/services/transactionService');
const blockchainService = require('../src/services/blockchainService');
const Beneficiary = require('../src/models/Beneficiary');
const Inventory = require('../src/models/Inventory');

describe('PDS Transaction Distribution & Business Logic Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase(true);
    await blockchainService.init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should process a valid distribution transaction through FBA consensus and mine into blockchain', async () => {
    const payload = {
      beneficiaryId: 'BEN-1001',
      shopId: 'FPS-102',
      commodity: 'Rice',
      quantity: 5
    };

    const result = await transactionService.processDistribution(payload);

    expect(result.success).toBe(true);
    expect(result.transaction).toBeDefined();
    expect(result.transaction.status).toBe('Verified');
    expect(result.block).toBeDefined();
    expect(result.block.blockNumber).toBeGreaterThan(0);
    expect(result.receipt).toBeDefined();
    expect(result.consensus.status).toBe('ACHIEVED');
    expect(result.consensus.participatingValidators).toBe(12);

    // Verify quota deduction
    const ben = await Beneficiary.findOne({ where: { beneficiaryId: 'BEN-1001' } });
    expect(ben.currentMonthClaimed.Rice).toBe(5);

    // Verify inventory deduction
    const inv = await Inventory.findOne({ where: { ownerType: 'SHOP', ownerId: 'FPS-102', commodityName: 'Rice' } });
    expect(inv.quantity).toBe(1795); // 1800 - 5
  });

  it('should reject distribution for unknown beneficiary ID', async () => {
    const payload = {
      beneficiaryId: 'BEN-99999',
      shopId: 'FPS-102',
      commodity: 'Rice',
      quantity: 5
    };

    await expect(transactionService.processDistribution(payload)).rejects.toThrow(/not found/i);
  });

  it('should reject distribution when requested quantity exceeds monthly entitlement quota', async () => {
    const payload = {
      beneficiaryId: 'BEN-1001',
      shopId: 'FPS-102',
      commodity: 'Sugar',
      quantity: 50 // Entitlement is 2 KG
    };

    await expect(transactionService.processDistribution(payload)).rejects.toThrow(/exceeds remaining monthly quota/i);
  });

  it('should reject distribution when shop has insufficient stock', async () => {
    // Set shop inventory for Kerosene to 0
    await Inventory.update(
      { quantity: 0 },
      { where: { ownerType: 'SHOP', ownerId: 'FPS-102', commodityName: 'Kerosene' } }
    );

    const payload = {
      beneficiaryId: 'BEN-1002',
      shopId: 'FPS-102',
      commodity: 'Kerosene',
      quantity: 1
    };

    await expect(transactionService.processDistribution(payload)).rejects.toThrow(/insufficient shop inventory/i);
  });

  it('should prevent immediate duplicate transactions', async () => {
    const payload = {
      beneficiaryId: 'BEN-1003',
      shopId: 'FPS-102',
      commodity: 'Wheat',
      quantity: 2
    };

    // First transaction succeeds
    const res1 = await transactionService.processDistribution(payload);
    expect(res1.success).toBe(true);

    // Immediate identical submission
    await expect(transactionService.processDistribution(payload)).rejects.toThrow(/duplicate transaction/i);
  });
});
