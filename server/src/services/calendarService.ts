/**
 * Calendar Service - Google Calendar API Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Creates Google Calendar events for election milestones
 * so users never miss important deadlines.
 */
import { google, calendar_v3 } from 'googleapis';
import { Milestone, CalendarReminderResponse } from '../../shared/types';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

/**
 * Build a Google Calendar event object from a Milestone.
 * Pure function — no side effects.
 *
 * Property 4: The event contains the milestone's date as start date
 * and the milestone's description in the summary.
 */
export function buildCalendarEvent(
  milestone: Milestone
): calendar_v3.Schema$Event {
  const startDate = new Date(milestone.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  return {
    summary: `${milestone.phaseName}: ${milestone.description}`,
    description: `Election milestone for ${milestone.electionFormat} election.\n\nPhase: ${milestone.phaseName}\n${milestone.description}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };
}

/**
 * Create a Google Calendar reminder event for an election milestone.
 */
export async function createReminder(
  milestone: Milestone
): Promise<CalendarReminderResponse> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const event = buildCalendarEvent(milestone);

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    if (response.data && response.data.id) {
      return {
        success: true,
        eventDetails: {
          eventId: response.data.id,
          summary: response.data.summary || milestone.phaseName,
          startDate: milestone.date,
          htmlLink: response.data.htmlLink || '',
        },
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Calendar API error';
    console.error(`[CalendarService] Failed to create reminder: ${message}`);
    throw new Error(
      `Google Calendar API is currently unavailable. Please manually note the date: ${milestone.date} - ${milestone.phaseName}`
    );
  }
}
