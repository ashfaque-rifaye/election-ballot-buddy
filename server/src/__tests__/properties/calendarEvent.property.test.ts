/**
 * Property Test: Calendar Event Request Correctness
 * Built with Google Antigravity & Vertex AI
 *
 * Property 4: For any milestone, buildCalendarEvent output
 * contains the milestone's date and description.
 *
 * **Validates: Requirements 3.2**
 */
import * as fc from 'fast-check';
import { buildCalendarEvent } from '../../services/calendarService';
import { Milestone, ElectionFormat } from '../../../shared/types';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const electionFormatArb: fc.Arbitrary<ElectionFormat> = fc.constantFrom(
  'local',
  'state',
  'national'
);

const milestoneArb: fc.Arbitrary<Milestone> = fc.record({
  id: fc.uuid(),
  phaseName: fc.string({ minLength: 1, maxLength: 50 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
    (d) => d.toISOString()
  ),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  electionFormat: electionFormatArb,
});

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 4: Calendar event request correctness', () => {
  it('event contains milestone date as start date', () => {
    fc.assert(
      fc.property(milestoneArb, (milestone) => {
        const event = buildCalendarEvent(milestone);

        // Start date should match milestone date
        const eventStart = event.start?.dateTime;
        expect(eventStart).toBeDefined();
        expect(new Date(eventStart!).toISOString()).toBe(
          new Date(milestone.date).toISOString()
        );
      }),
      { numRuns: 100 }
    );
  });

  it('event summary contains milestone description', () => {
    fc.assert(
      fc.property(milestoneArb, (milestone) => {
        const event = buildCalendarEvent(milestone);

        // Summary should contain the milestone description
        expect(event.summary).toContain(milestone.description);
        expect(event.summary).toContain(milestone.phaseName);
      }),
      { numRuns: 100 }
    );
  });

  it('event description contains election format', () => {
    fc.assert(
      fc.property(milestoneArb, (milestone) => {
        const event = buildCalendarEvent(milestone);
        expect(event.description).toContain(milestone.electionFormat);
      }),
      { numRuns: 100 }
    );
  });
});
