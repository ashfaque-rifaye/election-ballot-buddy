/**
 * Property Test: ElectionDataset Serialization Round-Trip
 * Built with Google Antigravity & Vertex AI
 *
 * Property 2: For any valid ElectionDataset, serializing to JSON
 * and deserializing back produces an equivalent object.
 *
 * **Validates: Requirements 2.4, 2.5**
 */
import * as fc from 'fast-check';
import { serializeDataset, deserializeDataset } from '../../services/storageService';
import { ElectionDataset, ElectionPhase, ElectionFormat } from '../../../shared/types';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const electionPhaseArb: fc.Arbitrary<ElectionPhase> = fc.constantFrom(
  'registration',
  'campaigning',
  'voting',
  'counting',
  'certification'
);

const electionFormatArb: fc.Arbitrary<ElectionFormat> = fc.constantFrom(
  'local',
  'state',
  'national'
);

const faqEntryArb = fc.record({
  id: fc.uuid(),
  question: fc.string({ minLength: 1, maxLength: 200 }),
  answer: fc.string({ minLength: 1, maxLength: 500 }),
  phase: electionPhaseArb,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
});

const milestoneEntryArb = fc.record({
  id: fc.uuid(),
  phaseName: fc.string({ minLength: 1, maxLength: 100 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
    (d) => d.toISOString()
  ),
  description: fc.string({ minLength: 1, maxLength: 300 }),
});

const pollingStationEntryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  address: fc.string({ minLength: 1, maxLength: 200 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true }),
});

const electionDatasetArb: fc.Arbitrary<ElectionDataset> = fc.record({
  id: fc.uuid(),
  format: electionFormatArb,
  faqs: fc.array(faqEntryArb, { maxLength: 10 }),
  milestones: fc.array(milestoneEntryArb, { maxLength: 10 }),
  pollingStations: fc.array(pollingStationEntryArb, { maxLength: 10 }),
  lastUpdated: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
    (d) => d.toISOString()
  ),
});

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 2: ElectionDataset serialization round-trip', () => {
  it('serialize then deserialize produces equivalent object', () => {
    fc.assert(
      fc.property(electionDatasetArb, (dataset) => {
        const serialized = serializeDataset(dataset);
        const deserialized = deserializeDataset(serialized);

        expect(deserialized.id).toBe(dataset.id);
        expect(deserialized.format).toBe(dataset.format);
        expect(deserialized.faqs).toEqual(dataset.faqs);
        expect(deserialized.milestones).toEqual(dataset.milestones);
        expect(deserialized.lastUpdated).toBe(dataset.lastUpdated);
        expect(deserialized.pollingStations.length).toBe(dataset.pollingStations.length);

        // Check polling stations (floating point comparison)
        for (let i = 0; i < dataset.pollingStations.length; i++) {
          expect(deserialized.pollingStations[i].id).toBe(dataset.pollingStations[i].id);
          expect(deserialized.pollingStations[i].name).toBe(dataset.pollingStations[i].name);
          expect(deserialized.pollingStations[i].address).toBe(dataset.pollingStations[i].address);
          expect(deserialized.pollingStations[i].latitude).toBeCloseTo(
            dataset.pollingStations[i].latitude,
            10
          );
          expect(deserialized.pollingStations[i].longitude).toBeCloseTo(
            dataset.pollingStations[i].longitude,
            10
          );
        }
      }),
      { numRuns: 100 }
    );
  });
});
