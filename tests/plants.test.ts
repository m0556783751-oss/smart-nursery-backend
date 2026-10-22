import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData, getToken } from './setup';

describe('Plants', () => {
  let staffToken: string;
  let customerToken: string;

  beforeAll(async () => {
    await setupTestData();
    staffToken = await getToken('staff@test.com', 'password123');
    customerToken = await getToken('customer@test.com', 'password123');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/plants', () => {
    it('should list all plants without authentication', async () => {
      const res = await request(app).get('/api/plants');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by search', async () => {
      const res = await request(app).get('/api/plants?search=Test');
      expect(res.status).toBe(200);
      expect(res.body.some((p: any) => p.name.includes('Test'))).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const res = await request(app).get('/api/plants?difficulty=EASY');
      expect(res.status).toBe(200);
      res.body.forEach((p: any) => expect(p.difficulty).toBe('EASY'));
    });
  });

  describe('GET /api/plants/:id', () => {
    it('should return plant details', async () => {
      const list = await request(app).get('/api/plants');
      const id = list.body[0].id;

      const res = await request(app).get(`/api/plants/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.category).toBeDefined();
    });

    it('should return 404 for non-existent plant', async () => {
      const res = await request(app).get('/api/plants/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/plants', () => {
    it('should create a plant as staff', async () => {
      const categories = await request(app).get('/api/categories');
      const res = await request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'New Test Plant',
          description: 'Created by test',
          categoryId: categories.body[0].id,
          price: 50,
          difficulty: 'MEDIUM',
          sunlight: 'PARTIAL_SHADE',
          wateringFrequencyDays: 5,
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Test Plant');
    });

    it('should reject creation by customer', async () => {
      const res = await request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Plant',
          description: 'Should fail',
          categoryId: 1,
          price: 10,
          difficulty: 'EASY',
          sunlight: 'FULL_SUN',
          wateringFrequencyDays: 3,
        });
      expect(res.status).toBe(403);
    });

    it('should reject without token', async () => {
      const res = await request(app).post('/api/plants').send({
        name: 'No Auth Plant',
        description: 'Should fail',
        categoryId: 1,
        price: 10,
        difficulty: 'EASY',
        sunlight: 'FULL_SUN',
        wateringFrequencyDays: 3,
      });
      expect(res.status).toBe(401);
    });
  });
});
