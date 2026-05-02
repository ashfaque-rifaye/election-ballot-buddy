/**
 * Timeline Router - GET /api/timeline
 * Built with Google Antigravity & Vertex AI
 *
 * Returns election milestones sorted chronologically
 * for the specified election format.
 */
import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { getDataset } from '../services/storageService';
import { sortMilestones } from '../utils/milestoneSort';
import { ElectionFormat, Milestone } from '../../shared/types';

const router = Router();

const VALID_FORMATS: ElectionFormat[] = ['local', 'state', 'national'];

router.get(
  '/',
  validationMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const format = (req.query.format as string) || 'national';

      if (!VALID_FORMATS.includes(format as ElectionFormat)) {
        res.status(400).json({
          error: {
            code: 400,
            message: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}`,
          },
        });
        return;
      }

      const dataset = await getDataset(format as ElectionFormat);

      // Convert MilestoneEntry to Milestone with format
      const milestones: Milestone[] = dataset.milestones.map((entry) => ({
        id: entry.id,
        phaseName: entry.phaseName,
        date: entry.date,
        description: entry.description,
        electionFormat: format as ElectionFormat,
      }));

      const sorted = sortMilestones(milestones);

      res.json({ milestones: sorted });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      console.error(`[TimelineRouter] Error: ${message}`);

      res.status(500).json({
        error: {
          code: 500,
          message: 'An error occurred while retrieving the timeline.',
        },
      });
    }
  }
);

export default router;
