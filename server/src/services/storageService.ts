/**
 * Storage Service - Google Cloud Storage Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Handles reading/writing ElectionDataset JSON files from/to
 * Google Cloud Storage with serialization round-trip guarantees.
 */
import { Storage } from '@google-cloud/storage';
import {
  ElectionDataset,
  ElectionFormat,
  ElectionPhase,
} from '../../shared/types';

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'election-assistant-data';
const storage = new Storage();

/**
 * Default fallback dataset used when Cloud Storage is unavailable
 * or the requested dataset is missing/corrupted.
 */
const DEFAULT_DATASET: ElectionDataset = {
  id: 'default',
  format: 'national',
  faqs: [
    {
      id: 'faq-1',
      question: 'How do I register to vote?',
      answer:
        'Visit your state election website or local election office to register. You can also register online in most states.',
      phase: 'registration' as ElectionPhase,
      tags: ['registration', 'getting-started'],
    },
  ],
  milestones: [
    {
      id: 'ms-1',
      phaseName: 'Registration Deadline',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Last day to register for the upcoming election.',
    },
  ],
  pollingStations: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Serialize an ElectionDataset to a JSON string.
 * Pure function — no side effects.
 */
export function serializeDataset(dataset: ElectionDataset): string {
  return JSON.stringify(dataset, null, 2);
}

/**
 * Deserialize a JSON string to an ElectionDataset.
 * Pure function — throws on invalid JSON.
 */
export function deserializeDataset(json: string): ElectionDataset {
  const parsed = JSON.parse(json);

  // Validate required fields
  if (!parsed.id || !parsed.format) {
    throw new Error('Invalid ElectionDataset: missing required fields (id, format)');
  }

  return {
    id: parsed.id,
    format: parsed.format,
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
    milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
    pollingStations: Array.isArray(parsed.pollingStations) ? parsed.pollingStations : [],
    lastUpdated: parsed.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Retrieve an ElectionDataset from Google Cloud Storage.
 * Falls back to default dataset on error.
 */
export async function getDataset(
  format: ElectionFormat
): Promise<ElectionDataset> {
  try {
    const fileName = `datasets/election-${format}.json`;
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      console.warn(
        `[StorageService] Dataset file not found: ${fileName}. Using default dataset.`
      );
      return { ...DEFAULT_DATASET, format };
    }

    const [contents] = await file.download();
    const dataset = deserializeDataset(contents.toString('utf-8'));
    return dataset;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown storage error';
    console.error(
      `[StorageService] Failed to retrieve dataset for format "${format}": ${message}`
    );
    return { ...DEFAULT_DATASET, format };
  }
}

/**
 * Save an ElectionDataset to Google Cloud Storage.
 */
export async function saveDataset(dataset: ElectionDataset): Promise<void> {
  try {
    const fileName = `datasets/election-${dataset.format}.json`;
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);

    const json = serializeDataset(dataset);
    await file.save(json, {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
      },
    });

    console.info(`[StorageService] Dataset saved: ${fileName}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown storage error';
    console.error(`[StorageService] Failed to save dataset: ${message}`);
    throw new Error(`Failed to save election dataset: ${message}`);
  }
}

export { DEFAULT_DATASET };
