import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData } from './setup';

describe('Auth', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      });
      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user.role).toBe('CUSTOMER');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'customer@test.com',
        password: 'password123',
        name: 'Duplicate',
      });
      expect(res.status).toBe(409);
    });

    it('should reject invalid data', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'bad-email',
        password: '12',
        name: '',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('customer@test.com');
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('customer@test.com');
    });

    it('should reject missing token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');
      expect(res.status).toBe(401);
    });
  });
});
