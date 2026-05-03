/**
 * Vertex AI Service Tests
 * Built with Google Antigravity & Vertex AI
 *
 * Tests prompt building, card extraction, and suggestion parsing.
 */
import { buildPrompt, parseAgentResponse } from '../vertexAIService';
import { Session } from '../../../shared/types';

describe('vertexAIService', () => {
  describe('buildPrompt', () => {
    it('includes system instructions', () => {
      const session: Session = {
        sessionId: 'test-1', userId: 'user-1', history: [],
        createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
      };
      const prompt = buildPrompt(session, 'Hello');
      expect(prompt).toContain('[SYSTEM]');
      expect(prompt).toContain('Indian Election Assistant');
    });

    it('includes session history in order', () => {
      const session: Session = {
        sessionId: 'test-2', userId: 'user-1',
        history: [
          { id: '1', role: 'user', content: 'First message', timestamp: new Date().toISOString() },
          { id: '2', role: 'agent', content: 'First reply', timestamp: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
      };
      const prompt = buildPrompt(session, 'Second message');
      const firstIdx = prompt.indexOf('First message');
      const replyIdx = prompt.indexOf('First reply');
      const secondIdx = prompt.indexOf('Second message');
      expect(firstIdx).toBeLessThan(replyIdx);
      expect(replyIdx).toBeLessThan(secondIdx);
    });

    it('includes current user message', () => {
      const session: Session = {
        sessionId: 'test-3', userId: 'user-1', history: [],
        createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
      };
      const prompt = buildPrompt(session, 'How do I register?');
      expect(prompt).toContain('How do I register?');
      expect(prompt).toContain('[USER]');
    });
  });

  describe('parseAgentResponse', () => {
    it('extracts FAQ cards', () => {
      const raw = 'Some text\n```card\n{"type":"faq","question":"Q?","answer":"A."}\n```\nMore text';
      const result = parseAgentResponse(raw, 'session-1');
      expect(result.cards).toHaveLength(1);
      expect(result.cards![0].type).toBe('faq');
      expect(result.response).toContain('Some text');
      expect(result.response).not.toContain('```card');
    });

    it('extracts image cards and sanitizes URLs', () => {
      const raw = '```card\n{"type":"image","url":"https://image.pollinations.ai/prompt/indian election?width=700&height=400&nologo=true","alt":"test","caption":"cap"}\n```';
      const result = parseAgentResponse(raw, 'session-2');
      expect(result.cards).toHaveLength(1);
      expect(result.cards![0].type).toBe('image');
      const imgCard = result.cards![0] as { type: string; url: string };
      expect(imgCard.url).toContain('pollinations.ai');
      expect(imgCard.url).toContain('nologo=true');
    });

    it('extracts suggestions', () => {
      const raw = 'Answer text\n```suggestions\n["Q1?", "Q2?", "Q3?"]\n```';
      const result = parseAgentResponse(raw, 'session-3');
      expect(result.suggestions).toEqual(['Q1?', 'Q2?', 'Q3?']);
      expect(result.response).not.toContain('suggestions');
    });

    it('provides default suggestions when none in response', () => {
      const raw = 'Just plain text answer';
      const result = parseAgentResponse(raw, 'session-4');
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('handles multiple cards', () => {
      const raw = '```card\n{"type":"faq","question":"Q1","answer":"A1"}\n```\n```card\n{"type":"reminder","phaseName":"Test","date":"2026-01-01","description":"Desc"}\n```';
      const result = parseAgentResponse(raw, 'session-5');
      expect(result.cards).toHaveLength(2);
    });

    it('skips malformed card JSON', () => {
      const raw = '```card\n{invalid json}\n```\n```card\n{"type":"faq","question":"Q","answer":"A"}\n```';
      const result = parseAgentResponse(raw, 'session-6');
      expect(result.cards).toHaveLength(1);
    });

    it('returns sessionId in response', () => {
      const result = parseAgentResponse('text', 'my-session');
      expect(result.sessionId).toBe('my-session');
    });
  });
});
