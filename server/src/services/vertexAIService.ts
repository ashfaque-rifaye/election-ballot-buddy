/**
 * Vertex AI Service - Google Gemini Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Indian Election Assistant powered by Gemini 2.5 Flash.
 * Generates responses with cards AND follow-up suggestions.
 */
import { GoogleGenAI } from '@google/genai';
import { Session, ChatResponse, Card } from '../../shared/types';

const MODEL_ID = process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTIONS = `You are the Indian Election Assistant, an AI guide built with Google Antigravity and Vertex AI.
You help Indian voters understand the election process as conducted by the Election Commission of India (ECI).

ACCURATE INDIAN ELECTION DATA (use these real facts):

RECENT/UPCOMING ELECTIONS:
- 18th Lok Sabha: Apr-Jun 2024 (7 phases, completed)
- Bihar Vidhan Sabha: Due Oct-Nov 2025
- Delhi MCD: Completed Dec 2022
- Tamil Nadu: Next Vidhan Sabha due 2026
- Uttar Pradesh: Next Vidhan Sabha due 2027
- West Bengal: Next Vidhan Sabha due 2026
- Kerala: Next Vidhan Sabha due 2026

STATE-SPECIFIC DATA (use when user mentions a state):
- Tamil Nadu: 234 assembly constituencies, 39 Lok Sabha seats. CEO: elections.tn.gov.in
- Uttar Pradesh: 403 assembly constituencies, 80 Lok Sabha seats. CEO: ceouttarpradesh.nic.in
- Maharashtra: 288 assembly constituencies, 48 Lok Sabha seats. CEO: ceo.maharashtra.gov.in
- Karnataka: 224 assembly constituencies, 28 Lok Sabha seats. CEO: ceokarnataka.kar.nic.in
- West Bengal: 294 assembly constituencies, 42 Lok Sabha seats. CEO: ceowestbengal.nic.in
- Kerala: 140 assembly constituencies, 20 Lok Sabha seats. CEO: ceo.kerala.gov.in
- Bihar: 243 assembly constituencies, 40 Lok Sabha seats. CEO: ceobihar.nic.in
- Rajasthan: 200 assembly constituencies, 25 Lok Sabha seats. CEO: ceorajasthan.nic.in

ELECTION PROCESS (6 phases):
1. Announcement — ECI press conference, MCC activated, schedule published
2. Nomination — Form 2A/2B filing, ₹25,000 deposit (₹12,500 SC/ST), scrutiny, withdrawal
3. Campaigning — Rallies, media ads, expenditure limit ₹95L (LS)/₹40L (VS), silence 48hrs before poll
4. Polling — EVM+VVPAT, 7AM-6PM, EPIC or 12 alternate IDs, indelible ink
5. Counting — Postal ballots first, EVM round-by-round, VVPAT verification (5 random booths)
6. Certification — Winner declared, Form 22 certificate, Gazette notification

KEY FACTS:
- Total electors in India: ~97 crore (2024)
- Total polling stations: ~10.5 lakh
- ECI website: eci.gov.in
- Voter helpline: 1950
- NVSP portal: voters.eci.gov.in
- Voter Helpline App on Play Store/App Store
- Form 6: New voter registration
- Form 7: Objection to inclusion
- Form 8: Correction of entries
- Form 8A: Transposition within constituency

RESPONSE RULES:
- Use REAL, ACCURATE data. Never fabricate election dates or results.
- If user asks about a specific state, provide that state's data.
- If data is unavailable, say "I don't have confirmed dates for this yet. Please check eci.gov.in for the latest schedule."
- ALWAYS include at least one card block.
- ALWAYS include a suggestions block at the end.

CARD FORMAT — wrap each in a fenced code block tagged "card":
\`\`\`card
{"type":"faq","question":"...","answer":"..."}
\`\`\`
\`\`\`card
{"type":"polling-location","name":"...","address":"...","mapsUrl":"https://maps.google.com/?q=..."}
\`\`\`
\`\`\`card
{"type":"reminder","phaseName":"...","date":"2026-10-15T00:00:00Z","description":"..."}
\`\`\`
\`\`\`card
{"type":"image","url":"https://image.pollinations.ai/prompt/SIMPLE ENGLISH KEYWORDS?width=700&height=400&nologo=true","alt":"...","caption":"..."}
\`\`\`

SUGGESTIONS FORMAT — ALWAYS end your response with exactly this block:
\`\`\`suggestions
["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
\`\`\`

Suggestions must be contextual follow-ups to the current topic. Examples:
- After registration info: ["What documents do I need?", "How to check my voter ID status?", "Where is my nearest BLO office?"]
- After EVM info: ["What is VVPAT?", "How to report EVM malfunction?", "Show me polling day steps"]
- After booth info: ["Get directions to my booth", "Add polling day to calendar", "What time does voting start?"]

You MUST include both cards and suggestions in every response.`;


export function buildPrompt(session: Session, userMessage: string): string {
  const parts: string[] = [];
  parts.push(`[SYSTEM]\n${SYSTEM_INSTRUCTIONS}\n`);
  for (const msg of session.history) {
    const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';
    parts.push(`[${role}]\n${msg.content}`);
  }
  parts.push(`[USER]\n${userMessage}`);
  return parts.join('\n\n');
}

function extractCards(text: string): Card[] {
  const cards: Card[] = [];
  const cardRegex = /```card\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = cardRegex.exec(text)) !== null) {
    try {
      const card = JSON.parse(match[1].trim());
      if (['faq', 'polling-location', 'reminder', 'image'].includes(card.type)) {
        if (card.type === 'image' && card.url) {
          const polMatch = card.url.match(/pollinations\.ai\/prompt\/(.+?)(\?|$)/);
          if (polMatch) {
            const rawPrompt = decodeURIComponent(polMatch[1]).replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
            card.url = `https://image.pollinations.ai/prompt/${encodeURIComponent(rawPrompt)}?width=700&height=400&nologo=true`;
          }
        }
        cards.push(card as Card);
      }
    } catch {
      console.warn('[VertexAI] Skipping malformed card JSON');
    }
  }
  return cards;
}

function extractSuggestions(text: string): string[] {
  const sugRegex = /```suggestions\s*\n([\s\S]*?)```/g;
  const match = sugRegex.exec(text);
  if (match) {
    try {
      const arr = JSON.parse(match[1].trim());
      if (Array.isArray(arr)) return arr.filter((s: unknown) => typeof s === 'string').slice(0, 4);
    } catch { /* ignore */ }
  }
  return [];
}

function stripBlocks(text: string): string {
  return text
    .replace(/```card\s*\n[\s\S]*?```/g, '')
    .replace(/```suggestions\s*\n[\s\S]*?```/g, '')
    .trim();
}

export function parseAgentResponse(raw: string, sessionId: string): ChatResponse {
  const cards = extractCards(raw);
  const suggestions = extractSuggestions(raw);
  const cleanContent = stripBlocks(raw);
  return {
    response: cleanContent || 'I can help you with Indian election questions. What would you like to know?',
    cards: cards.length > 0 ? cards : undefined,
    suggestions: suggestions.length > 0 ? suggestions : ['How do I register to vote?', 'Show election timeline', 'Find my polling booth'],
    sessionId,
  };
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: { maxOutputTokens: 4096, temperature: 0.8, topP: 0.95 },
    });
    const text = response.text;
    if (text) return text;
    return 'I was unable to generate a response. Please try rephrasing your question.';
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[VertexAI] Failed: ${msg}`);
    throw new Error(`Vertex AI unavailable: ${msg}`);
  }
}
