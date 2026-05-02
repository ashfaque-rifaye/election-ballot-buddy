/**
 * Chat Router - POST /api/chat
 * Built with Google Antigravity & Vertex AI
 *
 * Handles user chat messages, processes them through Vertex AI,
 * and returns contextual responses about the election process.
 */
import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { buildPrompt, generateResponse, parseAgentResponse } from '../services/vertexAIService';
import { getSession, addMessage } from '../services/sessionStore';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../shared/types';

const router = Router();

router.post(
  '/',
  validationMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?.uid || 'anonymous';

      // Get or create session
      const session = getSession(sessionId, userId);

      // Add user message to history
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      addMessage(session.sessionId, userMessage);

      // Build prompt with full session history and generate response
      const prompt = buildPrompt(session, message);
      const rawResponse = await generateResponse(prompt);

      // Parse response into structured format
      const chatResponse = parseAgentResponse(rawResponse, session.sessionId);

      // Add agent response to history
      const agentMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: chatResponse.response,
        cards: chatResponse.cards,
        timestamp: new Date().toISOString(),
      };
      addMessage(session.sessionId, agentMessage);

      res.json(chatResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      console.error(`[ChatRouter] Error: ${message}`);

      res.status(500).json({
        error: {
          code: 500,
          message: 'An error occurred while processing your message. Please try again.',
        },
      });
    }
  }
);

export default router;
