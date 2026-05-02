/**
 * Property Test: Milestones Chronological Ordering
 * Built with Google Antigravity & Vertex AI
 *
 * Property 3: For any list of milestones, sortMilestones produces
 * a list where each date <= the next date.
 *
 * **Validates: Requirements 3.1**
 */
import * as fc from 'fast-check';
import { sortMilestones } from '../../utils/milestoneSort';
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

describe('Property 3: Milestones chronological ordering', () => {
  it('sorted milestones are in chronological order', () => {
    fc.assert(
      fc.property(fc.array(milestoneArb, { maxLength: 50 }), (milestones) => {
        const sorted = sortMilestones(milestones);

        // Length should be preserved
        expect(sorted.length).toBe(milestones.length);

        // Each date should be <= the next date
        for (let i = 0; i < sorted.length - 1; i++) {
          const currentDate = new Date(sorted[i].date).getTime();
          const nextDate = new Date(sorted[i + 1].date).getTime();
          expect(currentDate).toBeLessThanOrEqual(nextDate);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('sorted milestones contain all original milestones', () => {
    fc.assert(
      fc.property(fc.array(milestoneArb, { maxLength: 50 }), (milestones) => {
        const sorted = sortMilestones(milestones);
        const sortedIds = sorted.map((m) => m.id).sort();
        const originalIds = milestones.map((m) => m.id).sort();
        expect(sortedIds).toEqual(originalIds);
      }),
      { numRuns: 100 }
    );
  });
});
