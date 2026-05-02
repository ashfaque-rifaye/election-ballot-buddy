/**
 * Property Test: Invalid Request Rejection
 * Built with Google Antigravity & Vertex AI
 *
 * Property 10: For any request body missing required fields
 * or containing invalid types, the endpoint returns 400.
 *
 * **Validates: Requirements 8.5**
 */
import * as fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import { validationMiddleware } from '../../middleware/validationMiddleware';

// Create a minimal test app with validation
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/chat', validationMiddleware, (_req, res) => {
    res.json({ success: true });
  });

  app.get('/api/polling-stations', validationMiddleware, (_req, res) => {
    res.json({ success: true });
  });

  return app;
}

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 10: Invalid request rejection', () => {
  const app = createTestApp();

  it('POST /api/chat rejects requests missing message field', async () => {
    const samples = fc.sample(fc.record({ sessionId: fc.string({ minLength: 1 }) }), 20);
    for (const body of samples) {
      const res = await request(app)
        .post('/api/chat')
        .send(body)
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(400);
    }
  });

  it('POST /api/chat rejects requests missing sessionId field', async () => {
    const samples = fc.sample(fc.record({ message: fc.string({ minLength: 1 }) }), 20);
    for (const body of samples) {
      const res = await request(app)
        .post('/api/chat')
        .send(body)
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(400);
    }
  });

  it('POST /api/chat rejects empty body', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({})
      .expect('Content-Type', /json/);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(400);
  });

  it('POST /api/chat rejects wrong types for message', async () => {
    const samples = fc.sample(
      fc.record({
        message: fc.oneof(fc.integer(), fc.boolean()),
        sessionId: fc.string({ minLength: 1 }),
      }),
      20
    );
    for (const body of samples) {
      const res = await request(app)
        .post('/api/chat')
        .send(body)
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(400);
    }
  });

  it('GET /api/polling-stations rejects requests without location', async () => {
    const res = await request(app)
      .get('/api/polling-stations')
      .expect('Content-Type', /json/);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(400);
  });
});
