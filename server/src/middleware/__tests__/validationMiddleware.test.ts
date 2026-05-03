/**
 * Validation Middleware Tests
 * Built with Google Antigravity & Vertex AI
 */
import { sanitize } from '../validationMiddleware';

describe('validationMiddleware', () => {
  describe('sanitize', () => {
    it('strips HTML tags', () => {
      expect(sanitize('<b>bold</b>')).toBe('bold');
    });

    it('strips script tags', () => {
      expect(sanitize('<script>alert("xss")</script>')).not.toContain('script');
      expect(sanitize('<script>alert("xss")</script>')).not.toContain('alert');
    });

    it('removes javascript: protocol', () => {
      expect(sanitize('javascript:alert(1)')).not.toContain('javascript');
    });

    it('removes event handlers', () => {
      expect(sanitize('onerror=alert(1)')).not.toContain('onerror');
    });

    it('preserves plain text', () => {
      expect(sanitize('How do I register to vote?')).toBe('How do I register to vote?');
    });

    it('handles empty string', () => {
      expect(sanitize('')).toBe('');
    });

    it('trims whitespace', () => {
      expect(sanitize('  hello  ')).toBe('hello');
    });

    it('removes eval expressions', () => {
      expect(sanitize('eval(document.cookie)')).not.toContain('eval');
    });

    it('removes document.cookie access', () => {
      expect(sanitize('document.cookie')).not.toContain('document.cookie');
    });

    it('handles nested HTML', () => {
      expect(sanitize('<div><p>text</p></div>')).toBe('text');
    });
  });
});
