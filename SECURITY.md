# Security Policy - Election Ballot Buddy

## Authentication & Authorization

- Google Identity OAuth 2.0 for user authentication
- JWT token validation via `google-auth-library`
- Role-based access control (RBAC): `voter` and `administrator` roles
- Admin endpoints restricted to `administrator` role only
- Token expiration checking enforced server-side

## Secret Management

- All API keys and OAuth credentials stored in **Google Secret Manager**
- Cloud Run loads secrets at runtime via `secretKeyRef` (never as plain env vars in deployment config)
- `.env` files excluded from version control via `.gitignore`
- No secrets hardcoded in source code
- Secret rotation supported via Secret Manager versioning

## Input Validation & Sanitization

- All user input sanitized using `sanitize-html` library
- HTML tags, script content, and XSS payloads stripped
- Request body validation with type checking and length limits
- Parameterized queries prevent injection attacks

## HTTP Security

- **Helmet** middleware sets security headers:
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy: strict-origin-when-cross-origin
- **CORS** restricted to allowed origins only
- **Rate limiting**: 100 requests per 15 minutes per IP

## Container Security

- Docker image runs as non-root user (`appuser`)
- Multi-stage build minimizes attack surface (no dev dependencies in production)
- Production image uses `node:20-slim` (minimal base)

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly by contacting the maintainer directly.
