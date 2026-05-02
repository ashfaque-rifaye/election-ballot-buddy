/**
 * Vertex AI Service - Google Vertex AI (Gemini) Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Handles prompt construction, Vertex AI API calls, and response parsing
 * for the Election Assistant's agentic conversation flow.
 */
import { VertexAI } from '@google-cloud/vertexai';
import { Session, ChatResponse, Card, Message } from '../../shared/types';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'election-assistant';
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
const MODEL_ID = process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro';

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

/**
 * System instructions for the Election Assistant agent.
 * Defines the agent's persona, capabilities, and response format.
 */
const SYSTEM_INSTRUCTIONS = `You are the Election Assistant, an AI-powered guide built with Google Antigravity and Vertex AI.
Your role is to help users understand the election process, timelines, and steps.

You guide users through five election phases:
1. Registration - How to register, deadlines, eligibility
2. Campaigning - Campaign rules, candidate information, debates
3. Voting - How to vote, polling locations, absentee/mail-in voting
4. Counting - Vote counting process, observers, timelines
5. Certification - Results certification, recounts, official announcements

Response Guidelines:
- Provide clear, step-by-step guidance for each election phase
- Adapt responses for local, state, or national election formats
- If a query is ambiguous, ask a clarifying follow-up question
- If you cannot determine intent, list available topics
- Keep responses concise but informative
- When relevant, suggest related topics the user might want to explore

Card Format (use JSON blocks when applicable):
- For FAQs: {"type":"faq","question":"...","answer":"..."}
- For polling locations: {"type":"polling-location","name":"...","address":"...","mapsUrl":"..."}
- For reminders: {"type":"reminder","phaseName":"...","date":"...","description":"..."}
- For images: {"type":"image","url":"https://pollinations.ai/p/[PROMPT_KEYWORDS]?width=800&height=600&model=flux","alt":"...","caption":"..."}

Always provide rich, dynamic UI cards when relevant. For example:
- Use images to visualize voting processes, patriotic themes, or infographics.
- Use polling locations if the user asks where to vote.
- Use reminders for important deadlines.

Wrap card JSON in \`\`\`card blocks when including them in responses.`;

/**
 * Build a prompt string that includes the full session history
 * and the current user message.
 *
 * Property 1: All N messages from session history are included
 * in the prompt, preserving order and content.
 */
export function buildPrompt(session: Session, userMessage: string): string {
  const parts: string[] = [];

  parts.push(`[SYSTEM]\n${SYSTEM_INSTRUCTIONS}\n`);

  // Include full session history preserving order
  for (const msg of session.history) {
    const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';
    parts.push(`[${role}]\n${msg.content}`);
  }

  // Add current user message
  parts.push(`[USER]\n${userMessage}`);

  return parts.join('\n\n');
}

/**
 * Parse card JSON blocks from the AI response text.
 */
function extractCards(text: string): Card[] {
  const cards: Card[] = [];
  const cardRegex = /```card\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = cardRegex.exec(text)) !== null) {
    try {
      const card = JSON.parse(match[1].trim());
      if (card.type === 'faq' || card.type === 'polling-location' || card.type === 'reminder' || card.type === 'image') {
        cards.push(card as Card);
      }
    } catch {
      // Skip malformed card JSON
      console.warn('[VertexAI] Skipping malformed card JSON in response');
    }
  }

  return cards;
}

/**
 * Remove card JSON blocks from text to get clean response content.
 */
function stripCardBlocks(text: string): string {
  return text.replace(/```card\s*\n[\s\S]*?```/g, '').trim();
}

/**
 * Parse the raw Vertex AI response into a structured ChatResponse.
 */
export function parseAgentResponse(
  raw: string,
  sessionId: string
): ChatResponse {
  const cards = extractCards(raw);
  const cleanContent = stripCardBlocks(raw);

  return {
    response: cleanContent || 'I can help you with election-related questions. What would you like to know?',
    cards: cards.length > 0 ? cards : undefined,
    sessionId,
  };
}

/**
 * Generate a response from Vertex AI Gemini model.
 */
export async function generateResponse(prompt: string): Promise<string> {
  try {
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;

    if (
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content?.parts
    ) {
      return response.candidates[0].content.parts
        .map((part) => part.text || '')
        .join('');
    }

    return 'I apologize, but I was unable to generate a response. Please try rephrasing your question about the election process.';
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Vertex AI error';
    console.error(`[VertexAI] Response generation failed: ${message}`);
    throw new Error(`Vertex AI service unavailable: ${message}`);
  }
}
