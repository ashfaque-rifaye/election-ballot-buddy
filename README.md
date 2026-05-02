# Election Assistant

> Interactive Agentic Flow with Google Antigravity & Vertex AI

A smart, dynamic assistant built for the **Hack2Skill Google Prompt Wars** hackathon. It uses **Google Vertex AI (Gemini)** to help users understand the election process, timelines, and steps through an interactive, chat-like interface.

## Features

- **Agentic Conversation Flow** — Step-by-step guidance through election phases using Vertex AI
- **Election Timeline** — Visual timeline of milestones with Google Calendar reminders
- **Polling Station Locator** — Find nearby polling stations via Google Maps API
- **Secure Authentication** — Google Identity with role-based access control
- **Accessible UI** — React interface with keyboard navigation and screen reader support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI | Google Vertex AI (Gemini) |
| Storage | Google Cloud Storage |
| APIs | Google Calendar API, Google Maps API |
| Auth | Google Identity / IAM |
| Hosting | Firebase Hosting (frontend) + Cloud Run (backend) |
| Testing | Jest + React Testing Library + fast-check (property-based) |

## Project Structure

```
election-assistant/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript)
├── shared/          # Shared TypeScript type definitions
├── data/            # Seed election datasets
├── cloudbuild.yaml  # Cloud Build config for backend
├── deploy.sh        # Deployment script
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase-tools`)

### Local Development

```bash
# Install all dependencies
npm run install:all

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start the backend (port 8080)
cd server && npm run dev

# Start the frontend (port 3000) in another terminal
cd client && npm run dev
```

The app runs in dev mode when `GOOGLE_CLIENT_ID` is not set, using mock authentication for local testing.

### Running Tests

```bash
npm test
```

## Deployment

### GCP Project: `project-c38d9dc7-c6ae-47d5-b59`

### Backend (Cloud Run)

```bash
# Build and submit from project root
gcloud builds submit --config cloudbuild.yaml --project project-c38d9dc7-c6ae-47d5-b59

# Deploy to Cloud Run
gcloud run deploy election-assistant-api \
  --image gcr.io/project-c38d9dc7-c6ae-47d5-b59/election-assistant-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --project project-c38d9dc7-c6ae-47d5-b59
```

### Frontend (Firebase Hosting)

```bash
cd client
npm run build
firebase deploy --only hosting --project project-c38d9dc7-c6ae-47d5-b59
```

### Full Deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

## Google Services Integration

- **Vertex AI** — Natural language understanding and response generation
- **Cloud Storage** — Persisting FAQs, timelines, and election datasets
- **Calendar API** — Election deadline reminders
- **Maps API** — Polling station locator
- **Identity/IAM** — Secure authentication and role-based access

---

Built with [Google Antigravity](https://cloud.google.com) for the Hack2Skill Google Prompt Wars Hackathon.
