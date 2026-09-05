const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { seedDatabase } = require('../src/seed/seedDatabase');

describe('Authentication & Authorization Test Suite', () => {
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
          username: 'testcitizen',
          password: 'password123',
          role: 'CITIZEN',
          name: 'Test Citizen',
          email: 'testcitizen@pdschain.local'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testcitizen');
      expect(res.body.user.role).toBe('CITIZEN');
    });

    it('should reject registration with duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin',
          password: 'password123',
          role: 'ADMIN'
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

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile with valid JWT', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('admin');
    });

    it('should reject access without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});

