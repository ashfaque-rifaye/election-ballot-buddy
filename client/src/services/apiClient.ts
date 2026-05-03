/**
 * API Client Service
 * Built with Google Antigravity & Vertex AI
 *
 * Handles all communication between the React frontend
 * and the Express backend API endpoints.
 */
import { ChatResponse, Milestone, CalendarReminderResponse } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

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
    throw new Error(message);
  }

  return response.json();
}

export async function sendMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

export async function getTimeline(
  format: string = 'national'
): Promise<{ milestones: Milestone[] }> {
  return apiRequest<{ milestones: Milestone[] }>(
    `/timeline?format=${encodeURIComponent(format)}`
  );
}

export async function getPollingStations(
  location: string
): Promise<{ stations: Array<{ id: string; name: string; address: string; latitude: number; longitude: number }> }> {
  return apiRequest(
    `/polling-stations?location=${encodeURIComponent(location)}`
  );
}

export async function createReminder(
  milestone: Milestone
): Promise<CalendarReminderResponse> {
  return apiRequest<CalendarReminderResponse>('/calendar/reminder', {
    method: 'POST',
    body: JSON.stringify({ milestone }),
  });
}
