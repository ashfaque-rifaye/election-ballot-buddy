/**
 * Authentication Middleware - Google Identity / IAM Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Validates Google Identity tokens, assigns user roles,
 * and enforces role-based access control on API endpoints.
 * Supports dev mode when GOOGLE_CLIENT_ID is not configured.
 */
import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UserRole } from '../../shared/types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Extended Express Request with authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Endpoint access control configuration.
 * Maps route patterns to allowed roles.
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  'POST /api/chat': ['voter', 'administrator'],
  'GET /api/timeline': ['voter', 'administrator'],
  'GET /api/polling-stations': ['voter', 'administrator'],
  'POST /api/calendar/reminder': ['voter', 'administrator'],
  'PUT /api/datasets': ['administrator'],
  'DELETE /api/datasets': ['administrator'],
  'GET /api/admin': ['administrator'],
};

/**
 * Determine if a role is authorized for a given endpoint.
 */
export function isAuthorized(
  role: UserRole,
  method: string,
  path: string
): boolean {
  const routeKey = `${method.toUpperCase()} ${path}`;

  if (ROUTE_PERMISSIONS[routeKey]) {
    return ROUTE_PERMISSIONS[routeKey].includes(role);
  }

  for (const [pattern, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (routeKey.startsWith(pattern)) {
      return roles.includes(role);
    }
  }

  return true;
}

/**
 * Determine user role based on email.
 */
function assignRole(email: string): UserRole {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'administrator' : 'voter';
}

/**
 * Decode a JWT payload without verification (for dev mode only).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Authentication middleware.
 * Validates the Google Identity token from the Authorization header.
 * Falls back to dev mode when GOOGLE_CLIENT_ID is not configured.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 401,
          message: 'Authentication required. Please sign in with your Google account.',
        },
      });
      return;
    }

    const token = authHeader.substring(7);

    // Dev mode: when no GOOGLE_CLIENT_ID is configured, accept decoded JWT
    if (!GOOGLE_CLIENT_ID) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.email && payload.sub) {
        const email = payload.email as string;
        const role = assignRole(email);
        req.user = {
          uid: payload.sub as string,
          email,
          role,
        };

        if (!isAuthorized(role, req.method, req.path)) {
          res.status(403).json({
            error: {
              code: 403,
              message: 'Access denied. You do not have permission to access this resource.',
            },
          });
          return;
        }

        next();
        return;
      }

      res.status(401).json({
        error: { code: 401, message: 'Invalid dev token.' },
      });
      return;
    }

    // Production mode: verify with Google OAuth
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      res.status(401).json({
        error: {
          code: 401,
          message: 'Invalid authentication token. Please sign in again.',
        },
      });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      res.status(401).json({
        error: {
          code: 401,
          message: 'Session expired. Please re-authenticate.',
        },
      });
      return;
    }

    const role = assignRole(payload.email);

    req.user = {
      uid: payload.sub,
      email: payload.email,
      role,
    };

    if (!isAuthorized(role, req.method, req.path)) {
      res.status(403).json({
        error: {
          code: 403,
          message: 'Access denied. You do not have permission to access this resource.',
        },
      });
      return;
    }

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Authentication error';
    console.error(`[AuthMiddleware] Authentication failed: ${message}`);

    res.status(401).json({
      error: {
        code: 401,
        message: 'Authentication failed. Please sign in again.',
      },
    });
  }
}
