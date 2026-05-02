/**
 * Integration Tests: API Endpoints
 * Built with Google Antigravity & Vertex AI
 *
 * Tests API endpoint request-response flows with mocked services.
 *
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.3**
 */
import request from 'supertest';
import express from 'express';
import { validationMiddleware } from '../../middleware/validationMiddleware';

/**
 * Create a test app without auth middleware for integration testing.
 */
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'Election Assistant API' });
  });

  // Chat endpoint with validation
  app.post('/api/chat', validationMiddleware, (req, res) => {
    const { message, sessionId } = req.body;
    res.json({
      response: `Echo: ${message}`,
      sessionId,
    });
  });

  // Timeline endpoint with validation
  app.get('/api/timeline', validationMiddleware, (req, res) => {
    const format = req.query.format || 'national';
    const validFormats = ['local', 'state', 'national'];
    if (!validFormats.includes(format as string)) {
      res.status(400).json({
        error: { code: 400, message: 'Invalid format' },
      });
      return;
    }
    res.json({ milestones: [] });
  });

  // Polling stations endpoint with validation
  app.get('/api/polling-stations', validationMiddleware, (req, res) => {
    if (!req.query.location) {
      res.status(400).json({
        error: { code: 400, message: 'Location required' },
      });
      return;
    }
    res.json({ stations: [] });
  });

  // Calendar reminder endpoint with validation
  app.post('/api/calendar/reminder', validationMiddleware, (req, res) => {
    if (!req.body.milestone) {
      res.status(400).json({
        error: { code: 400, message: 'Milestone required' },
      });
      return;
    }
    res.json({ success: true });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 404, message: 'Not found' } });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({
      error: { code: 500, message: 'Internal server error' },
    });
  });

  return app;
}

describe('API Integration Tests', () => {
  const app = createTestApp();

  describe('GET /api/health', () => {
    it('returns healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('POST /api/chat', () => {
    it('returns response for valid request', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'How do I register?', sessionId: 'test-session' });

      expect(res.status).toBe(200);
      expect(res.body.response).toContain('How do I register?');
      expect(res.body.sessionId).toBe('test-session');
    });

    it('returns 400 for missing message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ sessionId: 'test-session' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(400);
    });

    it('returns 400 for missing sessionId', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(400);
    });
  });

  describe('GET /api/timeline', () => {
    it('returns milestones for valid format', async () => {
      const res = await request(app).get('/api/timeline?format=national');
      expect(res.status).toBe(200);
      expect(res.body.milestones).toBeDefined();
    });

    it('returns milestones with default format', async () => {
      const res = await request(app).get('/api/timeline');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid format', async () => {
      const res = await request(app).get('/api/timeline?format=invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/polling-stations', () => {
    it('returns 400 when location is missing', async () => {
      const res = await request(app).get('/api/polling-stations');
      expect(res.status).toBe(400);
    });

    it('returns stations for valid location', async () => {
      const res = await request(app).get(
        '/api/polling-stations?location=Springfield%20IL'
      );
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/calendar/reminder', () => {
    it('returns 400 when milestone is missing', async () => {
      const res = await request(app)
        .post('/api/calendar/reminder')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns success for valid milestone', async () => {
      const res = await request(app)
        .post('/api/calendar/reminder')
        .send({
          milestone: {
            id: 'ms-1',
            phaseName: 'Registration',
            date: '2024-10-01T00:00:00.000Z',
            description: 'Registration deadline',
            electionFormat: 'national',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
    });
  });
});
