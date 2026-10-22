import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData, getToken } from './setup';

describe('Orders', () => {
  let staffToken: string;
  let customerToken: string;
  let testData: any;

  beforeAll(async () => {
    testData = await setupTestData();
    staffToken = await getToken('staff@test.com', 'password123');
    customerToken = await getToken('customer@test.com', 'password123');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/orders', () => {
    it('should create an order as customer', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ plantId: testData.plant.id });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.plantId).toBe(testData.plant.id);
    });

    it('should reject order for out of stock plant', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ plantId: testData.outOfStockPlant.id });
      expect(res.status).toBe(400);
    });

    it('should reject order by staff', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ plantId: testData.plant.id });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/orders', () => {
    it('should list customer own orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should list all orders as staff', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should complete an order as staff', async () => {
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ plantId: testData.plant.id });

      const res = await request(app)
        .patch(`/api/orders/${orderRes.body.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });

    it('should reject status update by customer', async () => {
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ plantId: testData.plant.id });

      const res = await request(app)
        .patch(`/api/orders/${orderRes.body.id}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(403);
    });
  });
});
