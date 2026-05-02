/**
 * Unit Tests: Storage Service Error Handling
 * Built with Google Antigravity & Vertex AI
 *
 * Tests error handling for missing/corrupted files
 * and fallback to default dataset.
 *
 * **Validates: Requirements 2.3**
 */
import { serializeDataset, deserializeDataset, DEFAULT_DATASET } from '../storageService';
import { ElectionDataset } from '../../../shared/types';

describe('storageService', () => {
  describe('serializeDataset', () => {
    it('serializes a valid dataset to JSON string', () => {
      const dataset: ElectionDataset = {
        id: 'test-1',
        format: 'national',
        faqs: [],
        milestones: [],
        pollingStations: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      const json = serializeDataset(dataset);
      expect(typeof json).toBe('string');
      expect(JSON.parse(json)).toEqual(dataset);
    });
  });

  describe('deserializeDataset', () => {
    it('deserializes valid JSON to ElectionDataset', () => {
      const dataset: ElectionDataset = {
        id: 'test-1',
        format: 'local',
        faqs: [],
        milestones: [],
        pollingStations: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      const json = JSON.stringify(dataset);
      const result = deserializeDataset(json);
      expect(result).toEqual(dataset);
    });

    it('throws on corrupted/invalid JSON', () => {
      expect(() => deserializeDataset('not valid json')).toThrow();
    });

    it('throws on missing required fields', () => {
      expect(() => deserializeDataset(JSON.stringify({ faqs: [] }))).toThrow(
        'Invalid ElectionDataset: missing required fields'
      );
    });

    it('defaults arrays when missing', () => {
      const json = JSON.stringify({ id: 'test', format: 'national' });
      const result = deserializeDataset(json);
      expect(result.faqs).toEqual([]);
      expect(result.milestones).toEqual([]);
      expect(result.pollingStations).toEqual([]);
    });
  });

  describe('DEFAULT_DATASET', () => {
    it('has required structure', () => {
      expect(DEFAULT_DATASET.id).toBeDefined();
      expect(DEFAULT_DATASET.format).toBeDefined();
      expect(Array.isArray(DEFAULT_DATASET.faqs)).toBe(true);
      expect(Array.isArray(DEFAULT_DATASET.milestones)).toBe(true);
      expect(Array.isArray(DEFAULT_DATASET.pollingStations)).toBe(true);
    });
  });
});
