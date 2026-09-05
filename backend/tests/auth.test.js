const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { seedDatabase } = require('../src/seed/seedDatabase');
const User = require('../src/models/User');

describe('Authentication & RBAC Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase(true);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new citizen user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testcitizen_new',
          password: 'password123',
          name: 'Test Citizen New',
          email: 'testcitizen_new@pdschain.local'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testcitizen_new');
      expect(res.body.user.role).toBe('CITIZEN');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should prevent self-registering as ADMIN and default to CITIZEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'fakeadmin',
          password: 'password123',
          role: 'ADMIN',
          name: 'Fake Admin'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('CITIZEN');
    });

    it('should reject registration with duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'shortuser',
          password: '123'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login demo admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should login demo shop officer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'shop',
          password: 'shop123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('SHOP');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('RBAC Route Protection', () => {
    let adminToken, shopToken, citizenToken;

    beforeAll(async () => {
      const adminRes = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
      adminToken = adminRes.body.token;

      const shopRes = await request(app).post('/api/auth/login').send({ username: 'shop', password: 'shop123' });
      shopToken = shopRes.body.token;

      const citizenRes = await request(app).post('/api/auth/login').send({ username: 'citizen', password: 'citizen123' });
      citizenToken = citizenRes.body.token;
    });

    it('should reject access to protected route with no token', async () => {
      const res = await request(app).get('/api/dashboard/admin');
      expect(res.status).toBe(401);
    });

    it('should reject access to protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', 'Bearer invalid.token.payload');
      expect(res.status).toBe(401);
    });

    it('should reject citizen accessing admin dashboard (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${citizenToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin accessing admin dashboard (200 OK)', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.stats).toBeDefined();
    });

    it('should reject citizen attempting to create a beneficiary (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/beneficiaries')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ name: 'Hacked Beneficiary' });
      expect(res.status).toBe(403);
    });

    it('should allow admin creating a beneficiary (201 Created)', async () => {
      const res = await request(app)
        .post('/api/beneficiaries')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Official Citizen Beneficiary', region: 'Chennai Central', household: 4 });
      expect(res.status).toBe(201);
      expect(res.body.beneficiary.name).toBe('Official Citizen Beneficiary');
    });

    it('should reject citizen attempting to distribute ration (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ beneficiaryId: 'BEN-1001', shopId: 'FPS-102', commodity: 'Rice', quantity: 5 });
      expect(res.status).toBe(403);
    });

    it('should allow shop officer accessing shop dashboard (200 OK)', async () => {
      const res = await request(app)
        .get('/api/dashboard/shop?shopId=FPS-102')
        .set('Authorization', `Bearer ${shopToken}`);
      expect(res.status).toBe(200);
      expect(res.body.shopId).toBe('FPS-102');
    });
  });
});
