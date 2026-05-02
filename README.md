# Election Assistant

> Interactive Agentic Flow with Google Antigravity & Vertex AI

A smart, dynamic assistant built for the **Hack2Skill Google Prompt Wars** hackathon. It uses **Google Vertex AI (Gemini)** to help users understand the election process, timelines, and steps through an interactive, chat-like interface.

## Features

- **Agentic Conversation Flow** — Step-by-step guidance through election phases using Vertex AI
- **Election Timeline** — Visual timeline of milestones with Google Calendar reminders
- **Polling Station Locator** — Find nearby polling stations via Google Maps API
- **Secure Authentication** — Google Identity with role-based access control
- **Accessible UI** — WCAG-compliant React interface with keyboard navigation and screen reader support

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
└── README.md
```

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

- **Frontend**: Firebase Hosting (`firebase deploy --only hosting`)
- **Backend**: Google Cloud Run (`gcloud run deploy`)

## Google Services Integration

- **Vertex AI** — Natural language understanding and response generation
- **Cloud Storage** — Persisting FAQs, timelines, and election datasets
- **Calendar API** — Election deadline reminders
- **Maps API** — Polling station locator
- **Identity/IAM** — Secure authentication and role-based access

---

Built with [Google Antigravity](https://cloud.google.com) for the Hack2Skill Google Prompt Wars Hackathon.
