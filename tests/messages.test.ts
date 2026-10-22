import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestData, cleanupTestData, getToken } from './setup';

describe('Messages', () => {
  let customerToken: string;
  let staffToken: string;
  let testData: any;

  beforeAll(async () => {
    testData = await setupTestData();
    customerToken = await getToken('customer@test.com', 'password123');
    staffToken = await getToken('staff@test.com', 'password123');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/messages', () => {
    it('should send a message as customer', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ content: 'My plant is wilting, help!', plantId: testData.plant.id });
      expect(res.status).toBe(201);
      expect(res.body.content).toBe('My plant is wilting, help!');
      expect(res.body.plantId).toBe(testData.plant.id);
    });

    it('should send a message without plantId', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ content: 'General question about plant care' });
      expect(res.status).toBe(201);
      expect(res.body.plantId).toBeNull();
    });

    it('should reject message by staff', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ content: 'Staff should not send messages' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/messages', () => {
    it('should list customer own messages', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should list all messages as staff', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PATCH /api/messages/:id/reply', () => {
    it('should reply to a message as staff', async () => {
      const msgRes = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ content: 'Need help with watering' });

      const res = await request(app)
        .patch(`/api/messages/${msgRes.body.id}/reply`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ reply: 'Water it every 3 days' });
      expect(res.status).toBe(200);
      expect(res.body.reply).toBe('Water it every 3 days');
      expect(res.body.repliedBy).toBeDefined();
    });

    it('should reject double reply', async () => {
      const msgRes = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ content: 'Another question' });

      await request(app)
        .patch(`/api/messages/${msgRes.body.id}/reply`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ reply: 'First reply' });

      const res = await request(app)
        .patch(`/api/messages/${msgRes.body.id}/reply`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ reply: 'Second reply should fail' });
      expect(res.status).toBe(400);
    });

    it('should reject reply by customer', async () => {
      const msgRes = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ content: 'Yet another question' });

      const res = await request(app)
        .patch(`/api/messages/${msgRes.body.id}/reply`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reply: 'Customer should not reply' });
      expect(res.status).toBe(403);
    });
  });
});
