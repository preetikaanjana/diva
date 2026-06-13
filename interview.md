# Diva Interview Guide

This file explains how the **Diva** website works end-to-end, including folder structure, file responsibilities, backend/frontend workflows, deployment behavior, and likely interview questions.

---

## 1) Project Summary

Diva is a full-stack social web app focused on:

- Authentication (signup/login/profile)
- Feed/blog publishing (draft + publish + like + save)
- Community forum (questions + replies)
- Follow system (requests, accept/decline, followers/following)
- Story-style updates (24h active window)
- Chat assistant:
  - Primary: Groq/OpenAI-compatible LLM endpoint
  - Fallback: local NLP intent engine

Tech stack:

- Frontend: React (CRA), React Router, custom API layer
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT Bearer token
- Deployment: Render (single service serving both API and React build)

---

## 2) High-Level Architecture

### Runtime Architecture

1. User opens React app.
2. React calls backend `/api/*` endpoints via `client/src/api/divaApi.js`.
3. Backend validates JWT for protected routes (`requireAuth` middleware).
4. Backend reads/writes MongoDB collections via Mongoose models.
5. For chat:
   - backend calls Groq/OpenAI-compatible endpoint when configured
   - frontend falls back to local NLP matching if AI API unavailable
6. In production, Express serves static React build from `client/build`.

### Auth/Data Flow

- Token is stored in `localStorage` (`diva_token`).
- Each API request adds `Authorization: Bearer <token>` unless `skipAuth`.
- `AuthContext` checks session on app load using `/api/auth/me`.

---

## 3) Root Folder and File Explanations

### Root files

- `package.json`
  - Root scripts for local development and Render deployment.
  - Important scripts:
    - `dev`: run server + client concurrently
    - `render:build`: install/build both server and client
    - `render:start`: start backend (Render runtime)
- `package-lock.json`
  - Lockfile for root dependency graph.
- `.gitignore`
  - Excludes env files, build artifacts, node_modules.
- `render.yaml`
  - Render blueprint for build/start commands, health check, env var declarations.
- `DEPLOY.md`
  - Deployment instructions for Render and other platforms.
- `Procfile`
  - Process type for Heroku-like platforms (`web` command).
- `interview.md`
  - This interview guide.

### Root folders

- `client/`: React frontend.
- `server/`: Express + MongoDB backend.

---

## 4) Backend (`server/`) Explanation

### Core backend files

- `server/index.js`
  - Main application entry.
  - Loads env from `server/.env`.
  - Configures CORS, JSON parsing, auth middleware, helper utilities.
  - Contains all API route handlers.
  - Integrates AI chat provider call.
  - Serves React build in production.
  - Uses `process.env.PORT` for Render compatibility.

- `server/db.js`
  - Connects to MongoDB using `MONGODB_URI`.
  - Fails fast if URI missing.

- `server/package.json`
  - Backend dependencies (`express`, `mongoose`, `jsonwebtoken`, etc.).
  - Scripts: `start`, `dev`.

- `server/package-lock.json`
  - Backend dependency lockfile.

- `server/.gitignore`
  - Ensures `server/.env` is never committed.

### Data models

- `server/models/User.js`
  - User profile + auth-related fields.
  - Includes `savedBlogIds`, follower/following/post counters, privacy flag.

- `server/models/Blog.js`
  - Blog posts with draft support and `likedUserIds`.

- `server/models/Question.js`
  - Forum question + embedded replies.

- `server/models/FriendRequest.js`
  - Follow request lifecycle (`pending`, `accepted`, `declined`).

- `server/models/Story.js`
  - Story items with timestamp used for 24h filtering.

### Backend route groups

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- AI chat:
  - `POST /api/chat/message`
- Users:
  - list users, get profile, update profile/password/privacy
  - saved/liked blog views
- Blogs:
  - list published, drafts, detail, create/update/delete, like toggle
- Forum:
  - list/get/create question, add replies
- Follow graph:
  - incoming/sent/friends, send/accept/decline/cancel/unfollow/remove follower
- Stories:
  - active list, create, delete
- Health:
  - `GET /api/health`

---

## 5) Frontend (`client/`) Explanation

### Core frontend files

- `client/package.json`
  - Frontend scripts (`start`, `build`, `test`) and React dependencies.
- `client/package-lock.json`
  - Frontend lockfile.
- `client/README.md`
  - Frontend run/build notes.

### App bootstrap

- `client/src/index.js`
  - React app mount point.
- `client/src/index.css`
  - Global base styles.
- `client/src/App.js`
  - Route map and protected route handling.
  - Shows `Sidebar` only for authenticated users and non-landing routes.
- `client/src/App.css`
  - App-level layout styles.

### Auth and global state

- `client/src/context/AuthContext.js`
  - Global auth session state and actions (`login`, `logout`, `updateUser`).
  - Session restoration via `/api/auth/me`.

- `client/src/components/Auth/Login.js`
  - Login form + API call + context update.
- `client/src/components/Auth/Signup.js`
  - Signup form + account creation flow.
- `client/src/components/Auth/Auth.css`
  - Auth page styling.

### Layout/navigation components

- `client/src/components/Sidebar/Sidebar.js`
  - Main navigation panel for protected areas.
- `client/src/components/Sidebar/Sidebar.css`
  - Sidebar styling.
- `client/src/components/Footer.js`
  - Landing-page footer.
- `client/src/components/Footer.css`
  - Footer styling.

### API integration layer

- `client/src/api/divaApi.js`
  - Centralized fetch wrapper and typed endpoint functions.
  - Handles:
    - base URL calculation (`REACT_APP_API_URL` aware)
    - auth token injection
    - unified error parsing/throwing
  - This is the single source of truth for frontend API calls.

### Chatbot logic

- `client/src/pages/Chat.js`
  - Chat UI.
  - Calls backend AI endpoint.
  - Falls back to local NLP engine when AI fails.

- `client/src/utils/chatbotNlp.js`
  - Lightweight NLP engine:
    - tokenization
    - stopword filtering
    - stemming
    - bag-of-words vectors
    - cosine similarity intent matching
    - confidence-threshold fallback response

### Feature pages (business flows)

- `client/src/pages/Home.js` + `Home.css`
  - Public landing page and feature highlights.
- `client/src/pages/Feed.js` + `Feed.css`
  - Main authenticated dashboard/feed experience.
- `client/src/pages/Profile.js` + `Profile.css`
  - Own profile display and social stats.
- `client/src/pages/EditProfile.js` + `EditProfile.css`
  - Profile update form.
- `client/src/pages/ChangePassword.js`
  - Password update flow.
- `client/src/pages/Privacy.js`
  - Account privacy toggles.
- `client/src/pages/UserProfile.js`
  - Public/other-user profile view.
- `client/src/pages/Archive.js` + `Archive.css`
  - Archived/saved content view.
- `client/src/pages/Blog.js` + `Blog.css`
  - Blog listing + interactions.
- `client/src/pages/CreateBlog.js` + `CreateBlog.css`
  - Blog create/edit draft flow.
- `client/src/pages/BlogDrafts.js`
  - User drafts list.
- `client/src/pages/BlogDetail.js` + `BlogDetail.css`
  - Single blog page with interactions.
- `client/src/pages/Forum.js` + `Forum.css`
  - Questions feed.
- `client/src/pages/AskQuestion.js`
  - New question form.
- `client/src/pages/ForumDetail.js` + `ForumDetail.css`
  - Question detail + replies.
- `client/src/pages/Resources.js` + `Resources.css`
  - Curated educational/support content.
- `client/src/pages/ContactUs.js` + `ContactUs.css`
  - Contact page.
- `client/src/pages/Help.js`
  - Help/usage guidance page.
- `client/src/pages/Chat.css`
  - Chat UI styling.

### Static data and shared styles

- `client/src/data/resourcesList.js`
  - Structured resources dataset consumed by `Resources.js`.
- `client/src/styles/FormsDiva.css`
  - Shared form styling patterns.

---

## 6) End-to-End Workflow Explanations

### A) Signup/Login workflow

1. User submits signup/login form.
2. Frontend calls `authRegister` or `authLogin` in `divaApi`.
3. Backend validates input and user credentials.
4. Backend returns JWT + sanitized user payload.
5. Frontend stores token in `localStorage` and updates `AuthContext`.

Interview follow-up points:

- Why JWT over server sessions? (stateless, simpler horizontal scaling)
- Why sanitize user object? (avoid leaking `passwordHash`, PII minimization)

### B) Protected route workflow

1. `AuthContext` bootstraps user by calling `/api/auth/me`.
2. `App.js` `ProtectedRoute` checks `isAuthenticated`.
3. If false, user is redirected to `/`.

Interview follow-up points:

- Difference between UI-level protection and API-level protection.
- Why backend `requireAuth` is still mandatory.

### C) Blog workflow

1. User creates blog as draft or published.
2. Backend stores blog with generated `id`, timestamps, and author fields.
3. Likes are tracked as `likedUserIds`.
4. Saved blogs are tracked per user (`savedBlogIds`).
5. Derived booleans (`likedByMe`, `savedByMe`) are decorated server-side.

Interview follow-up points:

- Tradeoffs of storing arrays (`likedUserIds`) vs separate likes collection.
- Why server computes derived flags instead of frontend.

### D) Forum workflow

1. User posts question.
2. Others add replies (`/questions/:id/replies`).
3. Replies embedded in question doc for simpler read path.

Interview follow-up points:

- Embedded replies vs normalized reply table/collection.

### E) Follow/friend workflow

1. User sends request (`pending`).
2. Target accepts/declines.
3. Accepted requests count toward followers/following.
4. Counters are recalculated for consistency.

Interview follow-up points:

- Why recalculate counters from source-of-truth data.
- Handling race conditions on accept/unfollow operations.

### F) AI chatbot workflow

1. `Chat.js` posts user message + recent history to `/api/chat/message`.
2. Backend validates/sanitizes history.
3. Backend calls provider using OpenAI-compatible API:
   - `OPENAI_BASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
4. If provider fails or key missing, frontend falls back to local NLP matcher.

Interview follow-up points:

- Why keep fallback NLP path?
- Prompt-injection and output safety concerns.
- Timeout and error handling strategy.

---

## 7) Deployment Readiness (Render)

### Build/start behavior

- Build command (`render.yaml`): `npm run render:build`
  - installs server deps
  - installs client deps
  - builds React static bundle
- Start command: `npm run render:start`
  - starts Express server from `server/index.js`

### Required environment variables

- `NODE_ENV=production`
- `MONGODB_URI=<atlas-uri>`
- `JWT_SECRET=<32+ chars>`
- `OPENAI_API_KEY=<groq-key>`
- `OPENAI_BASE_URL=https://api.groq.com/openai/v1`
- `OPENAI_MODEL=llama-3.1-8b-instant`

Optional:

- `CLIENT_ORIGIN` (needed mainly in split frontend/backend domain deploy)

### Port binding

- Server uses `const PORT = Number(process.env.PORT) || 4000;`
- Render injects `PORT`; app binds correctly to it.

---

## 8) Security/Design Notes to Discuss in Interview

- Password hashing with `bcryptjs`.
- JWT expiration set to `30d` (tradeoff: convenience vs security).
- CORS in production controlled by `CLIENT_ORIGIN`.
- API response sanitization removes sensitive fields.
- Chat history size/content is trimmed before provider call.
- Input validation exists in routes but can be improved with schema validators (e.g., Zod/Joi).

---

## 9) Common Interview Questions + Strong Answers

### Architecture

1. **Why monolithic backend (`index.js`) instead of route modules?**
   - Faster iteration during refactor, centralized visibility.
   - Next step: split by domains (`auth`, `blogs`, `forum`, etc.) for maintainability.

2. **How does frontend communicate with backend in dev and prod?**
   - Dev: CRA proxy to `localhost:4000`.
   - Prod: same-origin `/api` from Express serving React build.

3. **Why MongoDB for this app?**
   - Flexible schema for evolving social features and nested forum replies.

### Authentication and authorization

4. **Where is auth enforced?**
   - Frontend route guard for UX + backend `requireAuth` for real security.

5. **How is session restored after refresh?**
   - Token in localStorage, then `/api/auth/me` hydration in `AuthContext`.

### Data modeling

6. **Why custom `id` fields in models?**
   - Stable app-level identifiers independent of Mongo internals; easier frontend handling.

7. **How are follower counts kept accurate?**
   - Derived from accepted follow requests and recalculated after changes.

### AI/NLP

8. **What makes chatbot “AI-based” here?**
   - Primary LLM provider integration via `/api/chat/message`.
   - Local NLP fallback for resilience.

9. **How do you protect from provider outages?**
   - Timeout + explicit error handling + deterministic local NLP fallback.

10. **How is prompt safety handled?**
    - System prompt constraints and input history sanitization.
    - Can be extended with moderation and output filters.

### Deployment/DevOps

11. **Why use root render scripts instead of ad-hoc shell commands?**
    - Reproducible builds and simpler CI logs/debugging.

12. **How do you verify deployment health?**
    - `/api/health` endpoint used as Render health check.

### Improvement roadmap

13. **What would you improve next?**
    - Rate limiting, request validation, structured logging.
    - Route/service layer decomposition.
    - Tests (unit + API integration + E2E).
    - Move from localStorage JWT to secure cookie strategy if needed.

---

## 10) Fast “Explain in 2 minutes” Script

"Diva is a full-stack social platform built with React, Express, and MongoDB. Authentication is JWT-based, with route protection in the UI and strict authorization on API endpoints. Core features include profiles, blogs with drafts/likes/saves, forum Q&A with replies, follow request workflows, and stories.  

The frontend uses a centralized API client and auth context for state/session handling. The backend has Mongoose models for each domain and a unified API layer in Express. For chatbot functionality, the app calls a Groq/OpenAI-compatible LLM API and falls back to a local NLP intent matcher when the provider is unavailable.  

Deployment is Render-ready: build scripts compile client assets and backend serves both API and static frontend, with environment-driven configuration and health checks."

---

## 11) Quick File-to-Feature Mapping (Cheat Sheet)

- Auth: `AuthContext.js`, `Login.js`, `Signup.js`, `/api/auth/*`
- Profiles: `Profile.js`, `EditProfile.js`, `UserProfile.js`, `/api/users/*`
- Blogs: `Blog*.js`, `CreateBlog.js`, `Feed.js`, `/api/blogs/*`
- Forum: `Forum*.js`, `AskQuestion.js`, `/api/questions/*`
- Follows: profile/social pages + `/api/follows/*`
- Stories: feed/profile views + `/api/stories/*`
- Chat: `Chat.js`, `chatbotNlp.js`, `/api/chat/message`
- Deploy: `render.yaml`, root `package.json`, `DEPLOY.md`

---

Use this document as your interview prep baseline and personalize examples from your own implementation decisions.
