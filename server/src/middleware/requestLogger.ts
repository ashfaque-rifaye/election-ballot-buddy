/**
 * Request Logger Middleware
 * Built with Google Antigravity & Vertex AI
 *
 * Logs all incoming API requests with timing data
 * for monitoring and performance analysis.
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Structured request logger that captures method, path,
 * status code, and response time for each API call.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(
      JSON.stringify({
        level,
        timestamp: new Date().toISOString(),
        method,
        path,
        statusCode,
        durationMs: duration,
        userAgent: req.get('user-agent')?.substring(0, 100),
      })
    );
  });

  next();
}
