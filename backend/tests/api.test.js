const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { seedDatabase } = require('../src/seed/seedDatabase');
const blockchainService = require('../src/services/blockchainService');

describe('REST API Endpoints Integration Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase(true);
    await blockchainService.init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('System & General APIs', () => {
    it('GET /api/health should return HEALTHY status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('HEALTHY');
      expect(res.body.blockchain.valid).toBe(true);
    });

    it('GET /api/data should return all entities for frontend bootstrap', async () => {
      const res = await request(app).get('/api/data');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.beneficiaries)).toBe(true);
      expect(Array.isArray(res.body.shops)).toBe(true);
      expect(Array.isArray(res.body.warehouses)).toBe(true);
      expect(Array.isArray(res.body.transactions)).toBe(true);
      expect(Array.isArray(res.body.validators)).toBe(true);
      expect(Array.isArray(res.body.blocks)).toBe(true);
      expect(res.body.beneficiaries.length).toBe(100);
      expect(res.body.shops.length).toBe(20);
      expect(res.body.warehouses.length).toBe(5);
      expect(res.body.validators.length).toBe(12);
    });
  });

  describe('Beneficiaries APIs', () => {
    it('GET /api/beneficiaries should list beneficiaries with filters', async () => {
      const res = await request(app).get('/api/beneficiaries?region=Chennai Central');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.beneficiaries.length).toBeGreaterThan(0);
    });

    it('GET /api/beneficiaries/:id should retrieve specific beneficiary', async () => {
      const res = await request(app).get('/api/beneficiaries/BEN-1024');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.beneficiary.name).toBe('Arun Kumar');
    });
  });

  describe('Shops & Warehouses APIs', () => {
    it('GET /api/shops should return shops directory', async () => {
      const res = await request(app).get('/api/shops');
      expect(res.status).toBe(200);
      expect(res.body.shops.length).toBe(20);
    });

    it('GET /api/warehouses should return warehouses directory', async () => {
      const res = await request(app).get('/api/warehouses');
      expect(res.status).toBe(200);
      expect(res.body.warehouses.length).toBe(5);
    });
  });

  describe('Blockchain APIs', () => {
    it('GET /api/blockchain should return ledger and chain', async () => {
      const res = await request(app).get('/api/blockchain');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.chain.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/blockchain/validate should return isValid: true', async () => {
      const res = await request(app).get('/api/blockchain/validate');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isValid).toBe(true);
    });
  });

  describe('Validators & FBA Consensus APIs', () => {
    it('GET /api/validators should return 12 validator nodes', async () => {
      const res = await request(app).get('/api/validators');
      expect(res.status).toBe(200);
      expect(res.body.validators.length).toBe(12);
    });

    it('POST /api/validators/:id/status should toggle node status', async () => {
      const res = await request(app)
        .post('/api/validators/VAL-05/status')
        .send({ status: 'Offline' });

      expect(res.status).toBe(200);
      expect(res.body.validator.status).toBe('Offline');
      expect(res.body.networkStatus.offlineCount).toBe(1);

      // Restore
      await request(app)
        .post('/api/validators/VAL-05/status')
        .send({ status: 'Online' });
    });

    it('GET /api/consensus/status and /api/consensus/quorum should return network state', async () => {
      const statusRes = await request(app).get('/api/consensus/status');
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.consensus.totalValidators).toBe(12);

      const quorumRes = await request(app).get('/api/consensus/quorum');
      expect(quorumRes.status).toBe(200);
      expect(quorumRes.body.slices.length).toBe(12);
    });
  });

  describe('Dashboards APIs', () => {
    it('GET /api/dashboard/admin should return admin stats', async () => {
      const res = await request(app).get('/api/dashboard/admin');
      expect(res.status).toBe(200);
      expect(res.body.stats.totalBeneficiaries).toBe(100);
      expect(res.body.stats.totalShops).toBe(20);
    });

    it('GET /api/dashboard/shop should return shop stats', async () => {
      const res = await request(app).get('/api/dashboard/shop?shopId=FPS-102');
      expect(res.status).toBe(200);
      expect(res.body.shopId).toBe('FPS-102');
    });

    it('GET /api/dashboard/citizen should return citizen stats', async () => {
      const res = await request(app).get('/api/dashboard/citizen?beneficiaryId=BEN-1024');
      expect(res.status).toBe(200);
      expect(res.body.beneficiaryId).toBe('BEN-1024');
    });
  });
});

