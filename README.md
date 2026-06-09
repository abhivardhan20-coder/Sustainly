# Sustainly

## Project Overview
* **Selected challenge vertical:** Sustainability & Personal Carbon Footprint Tracking.
* **Problem statement:** Individuals often lack clear, actionable insights into their daily environmental impact and need intelligent, contextual guidance to reduce their carbon footprint.
* **Solution summary:** Sustainly is an AI-powered sustainability companion. It uses an intelligent chat interface powered by Gemini to track daily actions, calculate impact points, and provide personalized, context-aware suggestions for sustainable living.

## Architecture
* **System design:** React-based Single Page Application (SPA) with a Vite dev server. State management is handled by Zustand with local persistence. User authentication and data backup are managed via Firebase (Auth and Firestore). The Assistant is powered by the Gemini API.
* **Component diagram:** 
  - `UI Layer`: React components (Dashboard, Profile, ChatLogger, Garden).
  - `State Layer`: Zustand (`useSustainlyStore`).
  - `Backend Integration`: Firebase services (Auth, Firestore).
  - `AI Integration`: Gemini API via Google GenAI SDK.
* **Data flow:** User inputs actions in chat -> Gemini processes context & extracts activities with point values -> Zustand updates local state -> Firebase syncs state (Firestore).

## Features
* **Smart Assistant Behavior:** Natural language logging of daily activities.
* **Dynamic Decision Making:** AI recommends actions based on the user's specific context, diet, region, and previous activity.
* **Context-Aware Responses:** The Gemini AI understands historical inputs to provide relevant continuous feedback.
* **Virtual Garden:** A visual representation of user impact, growing trees and flowers based on points earned.
* **Gamification:** Streaks and points to encourage consistent tracking.
* **Dark Mode:** Seamless light/dark theme persistence across sessions.

## Setup Instructions
* **Installation:** Run `npm install`
* **Environment variables:** Create a `.env` file based on `.env.example`. Requires `VITE_FIREBASE_API_KEY`, Firebase config, and `VITE_GEMINI_API_KEY` (if moved to frontend for pure SPA testing, or as `GEMINI_API_KEY` for backend mode).
* **Running locally:** Run `npm run dev` to start the Vite server.
* **Deployment:** Deploy to Vercel, Netlify, or Firebase Hosting. Run `npm run build` to generate static files.

## Usage Examples
* **Example inputs:** "I rode my bike 5 miles today and ate a vegan lunch."
* **Example outputs:** The AI Assistant logs: 1x Bike Ride (25 pts), 1x Vegan Meal (30 pts). It then suggests: "Great job! Would you like to try composting your kitchen scraps this week?"
* **User workflows:** User signs up -> completes onboarding (diet, commute) -> talks to the chat logger daily to earn points -> views progress and grows their virtual garden in the dashboard.

## Assumptions
* **Business assumptions:** Users want to track their carbon footprint but prefer conversational interfaces over manual forms.
* **Technical assumptions:** The Gemini API is available and can reliably extract structured JSON entities from unstructured text.

## Security Considerations
* **Data handling:** User profiles and logs are stored securely in Firestore, gated by Firebase Security Rules ensuring users can only read/write their own data.
* **Privacy protections:** No public sharing of user data; email authentication limits unauthorized access.

## Testing
* **How to run tests:** Run `npm run test` to execute the Vitest suite.
* **Coverage information:** Current coverage includes store state management (theme, addLog, streaks). Full component and API test coverage is planned.

## Future Improvements
* Comprehensive unit and E2E testing.
* Leaderboards for friendly competition.
* Integration with physical IoT devices for automated home energy tracking.
