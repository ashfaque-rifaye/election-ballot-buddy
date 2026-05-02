/**
 * Shared Type Definitions for Election Assistant
 * Built with Google Antigravity & Vertex AI
 *
 * These types are shared between the React frontend and Express backend
 * to ensure type safety across the full stack.
 */

// ─── Election Phases ─────────────────────────────────────────────────────────

export type ElectionPhase =
  | 'registration'
  | 'campaigning'
  | 'voting'
  | 'counting'
  | 'certification';

export type ElectionFormat = 'local' | 'state' | 'national';

export type UserRole = 'voter' | 'administrator';

// ─── Card Types ──────────────────────────────────────────────────────────────

export interface FAQCard {
  type: 'faq';
  question: string;
  answer: string;
}

export interface PollingLocationCard {
  type: 'polling-location';
  name: string;
  address: string;
  mapsUrl: string;
}

export interface ReminderCard {
  type: 'reminder';
  phaseName: string;
  date: string; // ISO 8601
  description: string;
  calendarEventId?: string;
}

export type Card = FAQCard | PollingLocationCard | ReminderCard;

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  cards?: Card[];
  timestamp: string; // ISO 8601
}

// ─── Milestones ──────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  phaseName: string;
  date: string; // ISO 8601
  description: string;
  electionFormat: ElectionFormat;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface Session {
  sessionId: string;
  userId: string;
  history: Message[];
  createdAt: string; // ISO 8601
  lastActiveAt: string; // ISO 8601
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string;
  role: UserRole;
}

// ─── Election Dataset (Cloud Storage) ────────────────────────────────────────

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  phase: ElectionPhase;
  tags: string[];
}

export interface MilestoneEntry {
  id: string;
  phaseName: string;
  date: string; // ISO 8601
  description: string;
}

export interface PollingStationEntry {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ElectionDataset {
  id: string;
  format: ElectionFormat;
  faqs: FAQEntry[];
  milestones: MilestoneEntry[];
  pollingStations: PollingStationEntry[];
  lastUpdated: string; // ISO 8601
}

// ─── API Request/Response Types ──────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  cards?: Card[];
  sessionId: string;
}

export interface CalendarReminderRequest {
  milestone: Milestone;
}

export interface CalendarReminderResponse {
  success: boolean;
  eventDetails?: {
    eventId: string;
    summary: string;
    startDate: string;
    htmlLink: string;
  };
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface APIError {
  statusCode: number;
  message: string;
  details?: string;
}

export interface ErrorResponse {
  error: {
    code: number;
    message: string;
  };
}
