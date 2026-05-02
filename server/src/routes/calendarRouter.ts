/**
 * Calendar Router - POST /api/calendar/reminder
 * Built with Google Antigravity & Vertex AI
 *
 * Creates Google Calendar events for election milestones
 * so users can set reminders for important deadlines.
 */
import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { createReminder } from '../services/calendarService';

const router = Router();

router.post(
  '/',
  validationMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { milestone } = req.body;

      if (!milestone || !milestone.id || !milestone.date || !milestone.phaseName) {
        res.status(400).json({
          error: {
            code: 400,
            message: 'Invalid milestone data. Required fields: id, date, phaseName.',
          },
        });
        return;
      }

      const result = await createReminder(milestone);
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      console.error(`[CalendarRouter] Error: ${message}`);

      if (message.includes('Calendar API')) {
        res.status(502).json({
          error: {
            code: 502,
            message: message,
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 500,
          message: 'An error occurred while creating the calendar reminder.',
        },
      });
    }
  }
);

export default router;
