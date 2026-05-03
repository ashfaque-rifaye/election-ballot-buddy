/**
 * Auth Middleware Tests
 * Built with Google Antigravity & Vertex AI
 */
import { isAuthorized } from '../authMiddleware';

describe('authMiddleware', () => {
  describe('isAuthorized', () => {
    it('allows voter access to chat endpoint', () => {
      expect(isAuthorized('voter', 'POST', '/api/chat')).toBe(true);
    });

    it('allows voter access to timeline endpoint', () => {
      expect(isAuthorized('voter', 'GET', '/api/timeline')).toBe(true);
    });

    it('allows voter access to polling stations', () => {
      expect(isAuthorized('voter', 'GET', '/api/polling-stations')).toBe(true);
    });

    it('allows voter access to calendar reminder', () => {
      expect(isAuthorized('voter', 'POST', '/api/calendar/reminder')).toBe(true);
    });

    it('denies voter access to admin endpoints', () => {
      expect(isAuthorized('voter', 'PUT', '/api/datasets')).toBe(false);
    });

    it('denies voter access to delete datasets', () => {
      expect(isAuthorized('voter', 'DELETE', '/api/datasets')).toBe(false);
    });

    it('allows administrator access to all endpoints', () => {
      expect(isAuthorized('administrator', 'POST', '/api/chat')).toBe(true);
      expect(isAuthorized('administrator', 'PUT', '/api/datasets')).toBe(true);
      expect(isAuthorized('administrator', 'DELETE', '/api/datasets')).toBe(true);
      expect(isAuthorized('administrator', 'GET', '/api/admin')).toBe(true);
    });

    it('allows access to unregistered routes by default', () => {
      expect(isAuthorized('voter', 'GET', '/api/unknown')).toBe(true);
    });
  });
});
