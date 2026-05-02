/**
 * Authentication Middleware - Google Identity / IAM Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Validates Google Identity tokens, assigns user roles,
 * and enforces role-based access control on API endpoints.
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
 * Property 7: Voters access public endpoints; admins access all.
 */
export function isAuthorized(
  role: UserRole,
  method: string,
  path: string
): boolean {
  const routeKey = `${method.toUpperCase()} ${path}`;

  // Check exact match first
  if (ROUTE_PERMISSIONS[routeKey]) {
    return ROUTE_PERMISSIONS[routeKey].includes(role);
  }

  // Check prefix matches for nested routes
  for (const [pattern, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (routeKey.startsWith(pattern)) {
      return roles.includes(role);
    }
  }

  // Default: allow voters and admins for unregistered public routes
  return true;
}

/**
 * Determine user role based on email.
 * Administrators are configured via ADMIN_EMAILS environment variable.
 */
function assignRole(email: string): UserRole {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'administrator' : 'voter';
}

/**
 * Authentication middleware.
 * Validates the Google Identity token from the Authorization header.
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

    // Check token expiration
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

    // Attach user info to request
    req.user = {
      uid: payload.sub,
      email: payload.email,
      role,
    };

    // Check authorization for this endpoint
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
