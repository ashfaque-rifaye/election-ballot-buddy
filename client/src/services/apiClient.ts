/**
 * API Client Service
 * Built with Google Antigravity & Vertex AI
 *
 * Handles all communication between the React frontend
 * and the Express backend API endpoints.
 */
import { ChatResponse, Milestone, CalendarReminderResponse } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get the auth token from session storage.
 */
function getAuthToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

/**
 * Make an authenticated API request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.error?.message || `Request failed with status ${response.status}`;

    if (response.status === 401) {
      const token = getAuthToken();
      if (token && !token.includes('.eyJzdWIiOiJkZW1vI')) {
        sessionStorage.removeItem('auth_token');
        window.location.href = '/';
      }
      throw new Error('Authentication failed. Please sign in again.');
    }

    throw new Error(message);
  }

  return response.json();
}

/**
 * Send a chat message to the Election Assistant.
 */
export async function sendMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

/**
 * Get election timeline milestones.
 */
export async function getTimeline(
  format: string = 'national'
): Promise<{ milestones: Milestone[] }> {
  return apiRequest<{ milestones: Milestone[] }>(
    `/timeline?format=${encodeURIComponent(format)}`
  );
}

/**
 * Get nearby polling stations.
 */
export async function getPollingStations(
  location: string
): Promise<{ stations: Array<{ id: string; name: string; address: string; latitude: number; longitude: number }> }> {
  return apiRequest(
    `/polling-stations?location=${encodeURIComponent(location)}`
  );
}

/**
 * Create a Google Calendar reminder for a milestone.
 */
export async function createReminder(
  milestone: Milestone
): Promise<CalendarReminderResponse> {
  return apiRequest<CalendarReminderResponse>('/calendar/reminder', {
    method: 'POST',
    body: JSON.stringify({ milestone }),
  });
}
