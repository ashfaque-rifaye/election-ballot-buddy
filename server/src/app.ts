/**
 * Express Application Setup
 * Built with Google Antigravity & Vertex AI
 *
 * Configures Express with security middleware, CORS, routes,
 * and global error handling for the Election Assistant API.
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/authMiddleware';
import chatRouter from './routes/chatRouter';
import timelineRouter from './routes/timelineRouter';
import pollingRouter from './routes/pollingRouter';
import calendarRouter from './routes/calendarRouter';

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────

// Helmet sets various HTTP headers for security
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 429,
      message: 'Too many requests. Please try again later.',
    },
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Election Assistant API',
    version: '1.0.0',
    platform: 'Google Antigravity',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes (protected by auth) ─────────────────────────────────────────

app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/timeline', authMiddleware, timelineRouter);
app.use('/api/polling-stations', authMiddleware, pollingRouter);
app.use('/api/calendar/reminder', authMiddleware, calendarRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Endpoint not found.',
    },
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[GlobalErrorHandler] Unhandled error: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    error: {
      code: 500,
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
});

export default app;
