import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData, getToken, prisma } from './setup';

describe('My Garden', () => {
  let customerToken: string;
  let staffToken: string;
  let testData: any;

  beforeAll(async () => {
    testData = await setupTestData();
    customerToken = await getToken('customer@test.com', 'password123');
    staffToken = await getToken('staff@test.com', 'password123');

    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ plantId: testData.plant.id });

    await request(app)
      .patch(`/api/orders/${order.body.id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'COMPLETED' });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/my-garden', () => {
    it('should return customer garden with plants and reminders', async () => {
      const res = await request(app)
        .get('/api/my-garden')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].plant).toBeDefined();
      expect(res.body[0].careReminders).toBeDefined();
    });

    it('should reject staff access', async () => {
      const res = await request(app)
        .get('/api/my-garden')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/my-garden');
      expect(res.status).toBe(401);
    });
  });
});
