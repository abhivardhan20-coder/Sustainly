# Product Requirements Document (PRD): Sustainly

## 1. Product Overview
**Product Name:** Sustainly  
**Vision:** Empower individuals to track and reduce their carbon footprint through intelligent, contextual guidance and gamification.  
**Target Audience:** Environmentally conscious individuals who want actionable insights and motivation to improve their daily sustainability habits without the friction of manual data entry.

## 2. Problem Statement
Individuals often lack clear, actionable insights into their daily environmental impact. Traditional carbon footprint trackers rely on tedious manual forms, leading to low user retention. Users need an intelligent, frictionless way to log actions and receive personalized guidance to foster sustainable living.

## 3. Product Goals & Success Metrics
### Goals
- Provide a frictionless, conversational interface for logging sustainable actions.
- Educate users on the CO₂ equivalent (CO₂e) impact of their daily choices.
- Increase user engagement and motivation through gamification (points, streaks, virtual garden).
- Offer highly contextual and personalized sustainability suggestions.

### Success Metrics (KPIs)
- **Daily Active Users (DAU):** Number of users interacting with the ChatLogger daily.
- **Retention Rate:** Percentage of users returning after 7 and 30 days.
- **Log Frequency:** Average number of actions logged per user per week.
- **Streak Maintenance:** Percentage of users maintaining a streak of 3+ days.

## 4. Key Features & Requirements
### 4.1. Intelligent ChatLogger (Core Feature)
- **Description:** A natural language chat interface powered by Gemini AI that allows users to log daily activities (e.g., "I rode my bike 5 miles today").
- **Requirements:**
  - Accept unstructured text and image inputs.
  - Parse inputs to extract structured data: Activity, CO₂e impact, and gamification Points.
  - Provide conversational feedback and personalized offsetting suggestions based on the user's past history and profile.

### 4.2. Virtual Garden & Gamification
- **Description:** A visual, rewarding representation of the user's positive environmental impact.
- **Requirements:**
  - Award points for every sustainable action logged.
  - Track consecutive days of logging to build Streaks.
  - Visually grow and unlock virtual elements (e.g., trees, flowers) in the Virtual Garden as the user accumulates points.

### 4.3. User Profile & Dashboard
- **Description:** A central hub for user data, metrics, and personalization.
- **Requirements:**
  - Collect baseline data during user onboarding (e.g., diet preferences, primary commute method).
  - Display accumulated points, historical logs, current streak, and the Virtual Garden on a personalized Dashboard.

### 4.4. Authentication & Data Privacy
- **Description:** Secure user accounts and data isolation.
- **Requirements:**
  - User sign-up and authentication via Firebase Auth.
  - Secure data persistence in Firestore.
  - Strict security rules ensuring users can only read/write their own personal data.

### 4.5. UI/UX & Theming
- **Description:** A modern, accessible, and responsive user interface.
- **Requirements:**
  - Responsive Single Page Application (SPA) design.
  - Support for both Light and Dark modes with seamless persistence across sessions.

## 5. System Architecture
- **Frontend:** React SPA built with Vite, utilizing TailwindCSS for styling, React Router for navigation, and Zustand for local state management.
- **Backend:** Node.js/Express BFF (Backend for Frontend) handling AI API routes, rate limiting, and input validation (using Zod).
- **AI Integration:** Google Gemini 2.5 Flash API configured for structured JSON output to reliably map natural language to application state.
- **Database & Auth:** Firebase Services (Authentication and Firestore).

## 6. Non-Functional Requirements
- **Performance:** Fast load times with snappy UI updates (leveraging Zustand for optimistic local state updates before syncing to Firebase).
- **Security:** Strict API rate limiting (e.g., 5 requests/min per IP) to prevent abuse and manage API costs. No API secrets (e.g., `GEMINI_API_KEY`) exposed to the client application.
- **Reliability:** Graceful error handling for scenarios like AI API limits (HTTP 429) and network failures. Code quality maintained via comprehensive Vitest test coverage (min 80%).

## 7. Future Enhancements (Post-MVP)
- Real-time streaming AI responses for a more fluid chat experience.
- Social features such as leaderboards and sharing achievements.
- Integration with real carbon tracking APIs or IoT devices for automated logging.
- Push notifications for streak reminders and daily suggested actions.
- Full offline mode with Progressive Web App (PWA) and Service Worker support.
- Data export functionality (CSV, PDF) for user records.
