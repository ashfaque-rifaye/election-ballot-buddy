# Election Ballot Buddy - Indian Election Assistant

> Interactive Agentic Flow with Google Antigravity & Vertex AI

**Challenge Vertical:** Election Assistant - Smart, Dynamic AI-Powered Guide for Indian Voters

**Live Demo:** [https://project-c38d9dc7-c6ae-47d5-b59.web.app](https://project-c38d9dc7-c6ae-47d5-b59.web.app)

**Backend API:** [https://election-assistant-api-593891331990.us-central1.run.app](https://election-assistant-api-593891331990.us-central1.run.app/api/health)

## Chosen Vertical

**Election Assistant** - A smart, dynamic assistant that guides Indian voters through the election process, timelines, and steps in an interactive, location-aware way using Google Vertex AI (Gemini 2.5 Flash) and multiple Google Cloud services.

## Approach & Logic

### Agentic Flow Design

The assistant implements a multi-step agentic conversation flow:

1. **User Query Analysis** - Gemini 2.5 Flash processes the user's natural language query with full session context
2. **Contextual Response Generation** - The AI generates structured responses with embedded card data (FAQ, polling locations, reminders, images)
3. **Dynamic UI Rendering** - The frontend parses the structured response and renders appropriate React components
4. **Follow-up Suggestions** - Every response includes 3-4 contextual follow-up questions to guide the user
5. **Session Continuity** - Full conversation history is maintained for context-aware follow-ups

### Decision-Making Logic

- **Phase Detection**: Identifies which election phase the user is asking about (registration, campaigning, voting, counting, certification)
- **State-Aware Responses**: When a user mentions a specific Indian state, the AI provides state-specific data (constituency count, CEO website, election schedule)
- **Card Type Selection**: The AI decides which UI components to render based on query context (FAQ cards for questions, polling cards for location queries, reminder cards for dates, image cards for visual topics)
- **Fallback Handling**: If data is unavailable, the assistant transparently says so and directs users to eci.gov.in

## How the Solution Works

### Architecture

```
User Browser (React SPA)
    |
    | HTTPS
    v
Firebase Hosting ──> Cloud Run (Express API)
                         |
                    ┌────┼────────────────┐
                    |    |                |
              Auth  |  Gemini 2.5    Google Cloud
            Middleware  Flash API     Services
                    |    |                |
                    |    v                |
                    | Vertex AI      ┌───┴───┐
                    | Service        |       |
                    |            Cloud    Calendar
                    |           Storage    API
                    |                |
                    |            Maps API
                    |
              Secret Manager
              (API Keys, OAuth)
```

### Request Flow

1. User types a question in the chat interface
2. Frontend sends authenticated POST to `/api/chat` with message + sessionId
3. Auth middleware validates Google Identity token (or dev token in dev mode)
4. Validation middleware sanitizes input (XSS prevention, HTML stripping)
5. Chat router builds prompt with full session history + system instructions
6. Gemini 2.5 Flash generates response with embedded card JSON blocks and suggestions
7. Response parser extracts cards, suggestions, and clean text
8. Frontend renders MessageBubble with dynamic card components and suggestion chips

### Key Features

- **Indian Election Context**: Real ECI data - 18th Lok Sabha 2024 results, state-wise constituency counts, actual dates
- **State-Wise Timelines**: Lok Sabha 2024, Tamil Nadu, Bihar, Kerala with progress tracking
- **Dark/Light Mode**: Theme toggle with Indian tricolor (saffron/white/green) branding
- **Follow-up Suggestions**: AI generates contextual next questions after every response
- **Image Cards**: Dynamic image generation with 3-tier fallback (original URL, retry, SVG placeholder)
- **Accessibility**: WCAG-compliant with ARIA labels, keyboard navigation, screen reader support, high contrast mode, reduced motion support

## Google Services Integration

| Service | Purpose | Implementation |
|---------|---------|---------------|
| **Vertex AI (Gemini 2.5 Flash)** | Natural language understanding, agentic response generation | `@google/genai` SDK, structured prompt with card/suggestion format |
| **Google Cloud Run** | Backend API hosting | Dockerized Express server, auto-scaling, HTTPS |
| **Firebase Hosting** | Frontend SPA hosting | Vite-built React app, CDN-served, SPA rewrites |
| **Google Cloud Storage** | Election dataset persistence | FAQs, milestones, polling station data as JSON |
| **Google Calendar API** | Election deadline reminders | Create calendar events for milestones via `googleapis` |
| **Google Maps API** | Polling station locator | Geocoding + Places API for nearby polling stations |
| **Google Identity / IAM** | Secure authentication | OAuth 2.0 via Google Identity Services SDK, role-based access |
| **Google Secret Manager** | Secure credential storage | GEMINI_API_KEY and GOOGLE_CLIENT_ID loaded at runtime |
| **Google Cloud Build** | CI/CD pipeline | Docker image build and push to Artifact Registry |
| **Google Artifact Registry** | Container image storage | Docker images for Cloud Run deployment |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI Engine | Google Gemini 2.5 Flash via `@google/genai` |
| Storage | Google Cloud Storage |
| APIs | Google Calendar API, Google Maps API |
| Auth | Google Identity / IAM + Secret Manager |
| Hosting | Firebase Hosting (frontend) + Cloud Run (backend) |
| CI/CD | Google Cloud Build + Artifact Registry |
| Testing | Jest + React Testing Library + fast-check (property-based) |
| Security | Helmet, CORS, rate limiting, input sanitization, Secret Manager |

## Project Structure

```
election-assistant/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # UI components (ChatView, Timeline, Cards)
│   │   ├── contexts/          # Auth + Theme contexts
│   │   ├── services/          # API client
│   │   └── index.css          # Global styles with dark/light theme
│   ├── firebase.json          # Firebase Hosting config
│   └── .env.example           # Frontend env template
├── server/                    # Express backend (TypeScript)
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Vertex AI, Storage, Calendar, Maps
│   │   ├── middleware/        # Auth + Validation middleware
│   │   └── utils/             # Utility functions
│   ├── Dockerfile             # Cloud Run container config
│   └── .env.example           # Backend env template
├── shared/                    # Shared TypeScript type definitions
├── data/                      # Seed election datasets
├── cloudbuild.yaml            # Cloud Build CI/CD config
├── deploy.sh                  # One-command deployment script
└── README.md
```

## Security Measures

- **Authentication**: Google Identity OAuth 2.0 with JWT validation
- **Authorization**: Role-based access control (voter/administrator)
- **Secret Management**: API keys stored in Google Secret Manager, loaded at runtime
- **Input Sanitization**: All user input sanitized via `sanitize-html` (XSS prevention)
- **HTTP Security Headers**: Helmet middleware (CSP, X-Frame-Options, HSTS)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Strict origin allowlist
- **Non-root Container**: Docker runs as non-root `appuser`
- **No Secrets in Code**: `.env` files excluded via `.gitignore`, never committed

## Accessibility (WCAG Compliance)

- ARIA labels on all interactive elements
- `role="log"` with `aria-live="polite"` for chat messages
- Keyboard navigation (Tab, Enter, Space) for all controls
- Skip-to-content link for screen readers
- Color contrast ratio >= 4.5:1 (WCAG AA)
- `prefers-reduced-motion` support
- `prefers-contrast: high` support
- Screen reader announcements for loading states
- Focus-visible outlines on all interactive elements

## Testing

- **Property-based tests** (fast-check): Serialization round-trip, RBAC, sanitization, session history, milestone sorting, calendar events, validation
- **Unit tests**: Component rendering, card type rendering, ARIA attributes
- **Integration tests**: API endpoint testing with mocked services

```bash
# Run all tests
npm test

# Run with coverage
cd server && npm test
cd client && npm test
```

## Getting Started

### Prerequisites

- Node.js 20+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase-tools`)

### Local Development

```bash
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
# Fill in your API keys in the .env files

# Start backend (port 8080)
cd server && npm run dev

# Start frontend (port 3000)
cd client && npm run dev
```

### Deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
# Backend: Cloud Build + Cloud Run with Secret Manager
gcloud builds submit --config cloudbuild.yaml
gcloud run deploy election-assistant-api \
  --image us-central1-docker.pkg.dev/PROJECT_ID/election-assistant/election-assistant-api:latest \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest"

# Frontend: Firebase Hosting
cd client && npm run build && firebase deploy --only hosting
```

## Assumptions

- Users have a Google account for authentication
- Election data is based on publicly available ECI information
- State election dates marked "Expected" are estimates based on constitutional term limits
- The assistant provides guidance only and does not replace official ECI communications
- Image generation uses Pollinations AI as a fallback when pre-cached images are unavailable

---

Built with [Google Antigravity](https://cloud.google.com) for the **Hack2Skill Google Prompt Wars Hackathon**.
