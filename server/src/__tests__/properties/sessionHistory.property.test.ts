/**
 * Property Test: Session History Included in Prompt
 * Built with Google Antigravity & Vertex AI
 *
 * Property 1: For any session with N messages, the prompt
 * includes all N messages preserving order and content.
 *
 * **Validates: Requirements 1.4**
 */
import * as fc from 'fast-check';
import { buildPrompt } from '../../services/vertexAIService';
import { Session, Message } from '../../../shared/types';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const messageArb: fc.Arbitrary<Message> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('user' as const, 'agent' as const),
  content: fc.string({ minLength: 1, maxLength: 200 }),
  timestamp: fc.date().map((d) => d.toISOString()),
});

const sessionArb: fc.Arbitrary<Session> = fc.record({
  sessionId: fc.uuid(),
  userId: fc.uuid(),
  history: fc.array(messageArb, { minLength: 0, maxLength: 20 }),
  createdAt: fc.date().map((d) => d.toISOString()),
  lastActiveAt: fc.date().map((d) => d.toISOString()),
});

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 1: Session history included in prompt', () => {
  it('prompt contains all session messages in order', () => {
    fc.assert(
      fc.property(
        sessionArb,
        fc.string({ minLength: 1, maxLength: 200 }),
        (session, userMessage) => {
          const prompt = buildPrompt(session, userMessage);

          // All history messages should appear in the prompt
          for (const msg of session.history) {
            expect(prompt).toContain(msg.content);
          }

          // Current user message should appear
          expect(prompt).toContain(userMessage);

          // Messages should appear in order (search from last found position)
          let searchFrom = 0;
          for (const msg of session.history) {
            const index = prompt.indexOf(msg.content, searchFrom);
            expect(index).toBeGreaterThanOrEqual(searchFrom);
            searchFrom = index + 1;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
