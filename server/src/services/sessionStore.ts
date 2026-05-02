/**
 * In-Memory Session Store
 * Built with Google Antigravity & Vertex AI
 *
 * Manages conversation sessions for context continuity.
 * In production, this would be backed by Cloud Firestore or Redis.
 */
import { Session, Message } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

const sessions = new Map<string, Session>();

/**
 * Get or create a session by ID.
 */
export function getSession(sessionId: string, userId: string): Session {
  let session = sessions.get(sessionId);

  if (!session) {
    session = {
      sessionId: sessionId || uuidv4(),
      userId,
      history: [],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    sessions.set(session.sessionId, session);
  }

  session.lastActiveAt = new Date().toISOString();
  return session;
}

/**
 * Add a message to a session's history.
 */
export function addMessage(sessionId: string, message: Message): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.history.push(message);
    session.lastActiveAt = new Date().toISOString();
  }
}

/**
 * Clean up expired sessions (older than 1 hour).
 */
export function cleanupSessions(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (new Date(session.lastActiveAt).getTime() < oneHourAgo) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupSessions, 15 * 60 * 1000);
