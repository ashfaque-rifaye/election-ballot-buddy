/**
 * Polling Router - GET /api/polling-stations
 * Built with Google Antigravity & Vertex AI
 *
 * Returns nearby polling stations based on user location
 * using Google Maps Places API.
 */
import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { findPollingStations } from '../services/mapsService';

const router = Router();

router.get(
  '/',
  validationMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const location = req.query.location as string;

      if (!location) {
        res.status(400).json({
          error: {
            code: 400,
            message: 'Please provide a location (address or zip code) to find polling stations.',
          },
        });
        return;
      }

      const stations = await findPollingStations(location);

      if (stations.length === 0) {
        res.json({
          stations: [],
          message: 'No polling stations found for this location. Try broadening your search area or using a different address.',
        });
        return;
      }

      res.json({ stations });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      console.error(`[PollingRouter] Error: ${message}`);

      if (message.includes('temporarily unavailable')) {
        res.status(502).json({
          error: {
            code: 502,
            message: 'Google Maps service is temporarily unavailable. Please try again later.',
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 500,
          message: 'An error occurred while searching for polling stations.',
        },
      });
    }
  }
);

export default router;
