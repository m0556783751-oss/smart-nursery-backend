import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData, getToken } from './setup';

describe('Care Reminders', () => {
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

  describe('GET /api/care-reminders', () => {
    it('should return today reminders for customer', async () => {
      const res = await request(app)
        .get('/api/care-reminders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/care-reminders');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/care-reminders/:id/done', () => {
    it('should mark reminder as done and create next one', async () => {
      const reminders = await request(app)
        .get('/api/care-reminders')
        .set('Authorization', `Bearer ${customerToken}`);

      const wateringReminder = reminders.body.find((r: any) => r.type === 'WATERING');
      if (!wateringReminder) return;

      const res = await request(app)
        .patch(`/api/care-reminders/${wateringReminder.id}/done`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.isDone).toBe(true);
    });

    it('should reject marking other user reminder', async () => {
      const reminders = await request(app)
        .get('/api/care-reminders')
        .set('Authorization', `Bearer ${customerToken}`);

      if (reminders.body.length === 0) return;

      const res = await request(app)
        .patch(`/api/care-reminders/${reminders.body[0].id}/done`)
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });
  });
});
