# Implementation Plan: Election Assistant

## Overview

Build a full-stack Election Assistant using React (frontend) and Node.js/Express (backend) with Google Cloud services. Implementation proceeds bottom-up: shared types → backend services → API routes → frontend components → integration wiring. Property-based tests use fast-check; unit/integration tests use Jest + React Testing Library.

## Tasks

- [x] 1. Project scaffolding and shared types
  - [x] 1.1 Initialize project structure with client/ and server/ directories, package.json files, TypeScript configs, and Jest configuration for both
    - Create `client/` (React via Create React App or Vite with TypeScript template) and `server/` (Express + TypeScript)
    - Install dependencies: express, @google-cloud/vertexai, @google-cloud/storage, googleapis, fast-check, jest, ts-jest, @testing-library/react, @testing-library/jest-dom
    - Configure Jest with ts-jest preset for both client and server
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.4_

  - [x] 1.2 Create shared TypeScript type definitions
    - Create `shared/types.ts` with all interfaces: Message, Card, FAQCard, PollingLocationCard, ReminderCard, Milestone, Session, User, ElectionDataset, FAQEntry, MilestoneEntry, PollingStationEntry, ElectionPhase, ChatRequest, ChatResponse, CalendarReminderRequest, CalendarReminderResponse, APIError, ErrorResponse
    - _Requirements: 2.2, 2.4, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Backend data layer and serialization
  - [x] 2.1 Implement storageService for Cloud Storage read/write
    - Create `server/src/services/storageService.ts`
    - Implement `getDataset(format: ElectionFormat): Promise<ElectionDataset>` that reads JSON from Cloud Storage bucket
    - Implement `saveDataset(dataset: ElectionDataset): Promise<void>` that serializes to JSON and writes to Cloud Storage
    - Implement `serializeDataset(dataset: ElectionDataset): string` and `deserializeDataset(json: string): ElectionDataset` as pure functions
    - Handle missing/corrupted file errors with descriptive messages and fallback to default dataset
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x]* 2.2 Write property test for ElectionDataset serialization round-trip
    - **Property 2: ElectionDataset serialization round-trip**
    - Generate random ElectionDataset objects with fast-check arbitraries, serialize then deserialize, assert equivalence
    - **Validates: Requirements 2.4, 2.5**

  - [x]* 2.3 Write unit tests for storageService error handling
    - Test missing file returns descriptive error and fallback
    - Test corrupted JSON returns descriptive error and fallback
    - _Requirements: 2.3_

- [x] 3. Backend Vertex AI and session management
  - [x] 3.1 Implement vertexAIService for prompt construction and response parsing
    - Create `server/src/services/vertexAIService.ts`
    - Implement `buildPrompt(session: Session, userMessage: string): string` that includes full session history and system instructions
    - Implement `generateResponse(prompt: string): Promise<string>` that calls Vertex AI Gemini API
    - Implement `parseAgentResponse(raw: string): ChatResponse` that extracts text and card data from AI response
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [x]* 3.2 Write property test for session history in prompt construction
    - **Property 1: Session history included in prompt**
    - Generate random sessions with N messages, verify buildPrompt output contains all N messages in order
    - **Validates: Requirements 1.4**

- [x] 4. Backend utility services
  - [x] 4.1 Implement calendarService for Google Calendar event creation
    - Create `server/src/services/calendarService.ts`
    - Implement `createReminder(milestone: Milestone): Promise<CalendarReminderResponse>` that creates a Google Calendar event
    - Implement `buildCalendarEvent(milestone: Milestone): CalendarEvent` as a pure function that constructs the event object
    - Handle Calendar API unavailability with descriptive error
    - _Requirements: 3.2, 3.3, 3.4_

  - [x]* 4.2 Write property test for calendar event request correctness
    - **Property 4: Calendar event request correctness**
    - Generate random milestones, verify buildCalendarEvent output contains correct date and description
    - **Validates: Requirements 3.2**

  - [x] 4.3 Implement mapsService for polling station lookup
    - Create `server/src/services/mapsService.ts`
    - Implement `findPollingStations(location: string): Promise<PollingStationEntry[]>` that queries Google Maps Places API
    - Handle no results and API unavailability with appropriate error messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.4 Implement milestone sorting utility
    - Create `server/src/utils/milestoneSort.ts`
    - Implement `sortMilestones(milestones: Milestone[]): Milestone[]` that sorts by date ascending
    - _Requirements: 3.1_

  - [x]* 4.5 Write property test for milestone chronological ordering
    - **Property 3: Milestones chronological ordering**
    - Generate random milestone lists, verify sortMilestones produces chronologically ordered output
    - **Validates: Requirements 3.1**

- [x] 5. Backend middleware
  - [x] 5.1 Implement authMiddleware for Google Identity token validation and role assignment
    - Create `server/src/middleware/authMiddleware.ts`
    - Validate Google Identity token from Authorization header
    - Assign role (voter or administrator) based on IAM configuration
    - Handle auth failure with 401, authorization failure with 403
    - Handle expired tokens with re-authentication prompt
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 Implement validationMiddleware for request sanitization
    - Create `server/src/middleware/validationMiddleware.ts`
    - Implement `sanitize(input: string): string` that strips dangerous HTML/script content
    - Implement per-route validation schemas for each endpoint
    - Return 400 with descriptive error for invalid requests
    - _Requirements: 8.5, 8.7_

  - [x]* 5.3 Write property test for role-based access control
    - **Property 7: Role-based access control**
    - Generate random user/role/endpoint combinations, verify access granted iff role is authorized
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [x]* 5.4 Write property test for invalid request rejection
    - **Property 10: Invalid request rejection**
    - Generate random invalid request bodies (missing fields, wrong types), verify 400 response
    - **Validates: Requirements 8.5**

  - [x]* 5.5 Write property test for input sanitization
    - **Property 11: Input sanitization**
    - Generate random strings with XSS/injection payloads, verify sanitized output contains no executable script content
    - **Validates: Requirements 8.7**

- [x] 6. Backend API routes
  - [x] 6.1 Implement chatRouter (POST /api/chat)
    - Create `server/src/routes/chatRouter.ts`
    - Accept message and sessionId, call vertexAIService, return ChatResponse
    - Apply authMiddleware and validationMiddleware
    - _Requirements: 8.1, 1.1, 1.3_

  - [x] 6.2 Implement timelineRouter (GET /api/timeline)
    - Create `server/src/routes/timelineRouter.ts`
    - Accept format query param, retrieve milestones from storageService, sort chronologically, return
    - Apply authMiddleware and validationMiddleware
    - _Requirements: 8.2, 3.1_

  - [x] 6.3 Implement pollingRouter (GET /api/polling-stations)
    - Create `server/src/routes/pollingRouter.ts`
    - Accept location query param, call mapsService, return stations
    - Apply authMiddleware and validationMiddleware
    - _Requirements: 8.3, 4.2_

  - [x] 6.4 Implement calendarRouter (POST /api/calendar/reminder)
    - Create `server/src/routes/calendarRouter.ts`
    - Accept milestone body, call calendarService, return result
    - Apply authMiddleware and validationMiddleware
    - _Requirements: 8.4, 3.2_

  - [x] 6.5 Wire all routes into Express app with error handling middleware
    - Create `server/src/app.ts` with Express app setup, CORS, JSON parsing, route mounting, and global error handler
    - Create `server/src/index.ts` entry point
    - Global error handler returns 500 with generic message and logs details server-side
    - _Requirements: 8.6_

  - [x]* 6.6 Write integration tests for API endpoints
    - Test each endpoint with valid requests (mocked services)
    - Test error responses for invalid requests
    - Test auth flow with mocked Google Identity
    - _Requirements: 9.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 7. Checkpoint - Backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 8. Frontend authentication and layout
  - [x] 8.1 Implement LoginView component with Google Sign-In
    - Create `client/src/components/LoginView.tsx`
    - Integrate Google Identity sign-in button
    - Handle auth success (store token, redirect to chat) and failure (show error)
    - _Requirements: 5.1, 5.5_

  - [x] 8.2 Implement App component with routing and auth state
    - Create `client/src/App.tsx`
    - Set up routes: / → LoginView, /chat → ChatView, /timeline → TimelineView
    - Protect routes with auth check, redirect unauthenticated users to login
    - Store auth token and user role in React context
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 9. Frontend chat interface
  - [x] 9.1 Implement ChatView component
    - Create `client/src/components/ChatView.tsx`
    - Render scrollable message history and message input field
    - On submit: display user message immediately, show LoadingIndicator, call POST /api/chat, render agent response
    - Use ARIA live region for new agent messages
    - _Requirements: 6.1, 6.2, 7.5_

  - [x] 9.2 Implement MessageBubble component
    - Create `client/src/components/MessageBubble.tsx`
    - Render user messages and agent messages with distinct styling
    - Support rich content: render inline Card components based on card type
    - _Requirements: 6.3_

  - [x] 9.3 Implement FAQCard, PollingLocationCard, and ReminderCard components
    - Create `client/src/components/FAQCard.tsx` — renders question and expandable answer
    - Create `client/src/components/PollingLocationCard.tsx` — renders station name, address, Google Maps link
    - Create `client/src/components/ReminderCard.tsx` — renders phase name, date, description, "Set Reminder" button that calls POST /api/calendar/reminder
    - All cards include ARIA labels and keyboard navigation
    - _Requirements: 6.4, 6.5, 6.6, 4.3, 7.1, 7.2_

  - [x]* 9.4 Write property test for card type rendering
    - **Property 8: Card type rendering**
    - Generate random agent responses with mixed card types, verify correct React component rendered for each card type
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**

  - [x]* 9.5 Write property test for PollingLocationCard rendering completeness
    - **Property 6: PollingLocationCard rendering completeness**
    - Generate random polling station data, verify rendered card contains name, address, and maps URL
    - **Validates: Requirements 4.3**

  - [x]* 9.6 Write property test for ARIA attributes on interactive components
    - **Property 9: ARIA attributes on interactive components**
    - Render each interactive component with random valid props, verify ARIA labels and roles present
    - **Validates: Requirements 7.2**

- [x] 10. Frontend timeline view
  - [x] 10.1 Implement TimelineView component
    - Create `client/src/components/TimelineView.tsx`
    - Fetch milestones from GET /api/timeline, render in chronological order
    - Each milestone shows phase name, date, description, and "Set Reminder" button
    - Include ARIA labels and keyboard navigation
    - _Requirements: 3.1, 3.5, 7.1, 7.2_

  - [x]* 10.2 Write property test for milestone rendering completeness
    - **Property 5: Milestone rendering completeness**
    - Generate random milestones, verify rendered output contains phase name, date, and description
    - **Validates: Requirements 3.5**

- [x] 11. Frontend services and API client
  - [x] 11.1 Implement API client service
    - Create `client/src/services/apiClient.ts`
    - Implement functions: sendMessage, getTimeline, getPollingStations, createReminder
    - Attach auth token to all requests
    - Handle API errors and network failures with user-friendly messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 12. Accessibility and styling
  - [x] 12.1 Apply accessible styling and keyboard navigation
    - Ensure all interactive elements have tabIndex and keyboard event handlers
    - Apply color scheme with minimum 4.5:1 contrast ratio
    - Add skip-to-content link
    - Verify ARIA live region on chat message container
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Checkpoint - Frontend complete
  - Ensure all frontend and backend tests pass, ask the user if questions arise.

- [x] 14. Deployment configuration
  - [x] 14.1 Create deployment configuration files
    - Create `server/Dockerfile` for Cloud Run deployment
    - Create `client/firebase.json` for Firebase Hosting configuration
    - Create `.firebaserc` with project configuration
    - Create `server/.env.example` with required environment variable names (no values)
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 14.2 Create seed election dataset
    - Create `data/election-dataset-sample.json` with sample FAQs, milestones, and polling stations for local/state/national formats
    - Keep file small to respect 10 MB repo limit
    - _Requirements: 2.1, 10.4_

- [ ] 15. Final checkpoint - All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All Google service calls should be mockable for testing
- Keep the repository under 10 MB — avoid committing large assets or node_modules
