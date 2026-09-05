const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { seedDatabase } = require('../src/seed/seedDatabase');
const Inventory = require('../src/models/Inventory');

describe('Warehouse Logistics & Stock Transfer Test Suite', () => {
  let warehouseToken, citizenToken;

  beforeAll(async () => {
    await seedDatabase(true);

    const whRes = await request(app).post('/api/auth/login').send({ username: 'warehouse', password: 'warehouse123' });
    warehouseToken = whRes.body.token;

    const citRes = await request(app).post('/api/auth/login').send({ username: 'citizen', password: 'citizen123' });
    citizenToken = citRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should execute an atomic stock transfer from warehouse to shop', async () => {
    // Initial stock
    const whBefore = await Inventory.findOne({ where: { ownerType: 'WAREHOUSE', ownerId: 'WH-001', commodityName: 'Rice' } });
    const shopBefore = await Inventory.findOne({ where: { ownerType: 'SHOP', ownerId: 'FPS-101', commodityName: 'Rice' } });

    const whInitial = whBefore.quantity;
    const shopInitial = shopBefore.quantity;

    const res = await request(app)
      .post('/api/warehouses/WH-001/transfer')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        shopId: 'FPS-101',
        commodity: 'Rice',
        quantity: 200
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transfer).toBeDefined();

    // Verify atomic state
    const whAfter = await Inventory.findOne({ where: { ownerType: 'WAREHOUSE', ownerId: 'WH-001', commodityName: 'Rice' } });
    const shopAfter = await Inventory.findOne({ where: { ownerType: 'SHOP', ownerId: 'FPS-101', commodityName: 'Rice' } });

    expect(whAfter.quantity).toBe(whInitial - 200);
    expect(shopAfter.quantity).toBe(shopInitial + 200);
  });

  it('should reject transfer when warehouse has insufficient inventory', async () => {
    const res = await request(app)
      .post('/api/warehouses/WH-001/transfer')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        shopId: 'FPS-101',
        commodity: 'Rice',
        quantity: 999999
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthorized citizen attempting stock transfer (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/warehouses/WH-001/transfer')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        shopId: 'FPS-101',
        commodity: 'Rice',
        quantity: 100
      });

    expect(res.status).toBe(403);
  });
});

