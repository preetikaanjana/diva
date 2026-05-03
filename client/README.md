# Diva — React client

Social platform UI: auth, profiles, blogs (Explore), forum, feed, stories, resources, and more. The **live data** (users, posts, forum, follows, stories) comes from the **Node API** in the parent repo’s `server/` folder, not from browser-only storage.

---

## What you need installed

- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node)

---

## Repository layout

```
diva/                    ← repository root (parent of this folder)
├── client/              ← this React app (you are here)
│   ├── src/
│   │   ├── api/         ← divaApi.js — all HTTP calls to the backend
│   │   ├── components/
│   │   ├── context/     ← AuthContext (user + JWT)
│   │   └── pages/
│   ├── public/
│   ├── .env.development
│   ├── .env.production
│   └── package.json     ← "proxy" → http://localhost:4000 for /api in dev
├── server/              ← Express API + MongoDB
└── DEPLOY.md            ← how to deploy the full stack
```

---

## Environment variables (React)

Create or edit files in **`client/`** (must start with `REACT_APP_` to be visible in the app). **Restart `npm start` after changes.**

| File | Purpose |
|------|--------|
| `.env.development` | Used when you run `npm start` |
| `.env.production` | Used when you run `npm run build` |

| Variable | When to set | What it does |
|----------|-------------|--------------|
| `REACT_APP_API_URL` | **Usually leave unset** | If **unset**, the app calls **`/api`** on the **same origin** (correct for production when Node serves both the build and the API). If set, requests go to that base URL (e.g. split deploy: `https://api.example.com`). |

**Local development (recommended):** leave `REACT_APP_API_URL` commented out in `.env.development`. The **`proxy`** in `package.json` forwards `/api` to `http://localhost:4000` while the UI runs on port **3000**.

---

## Running locally

### 1. Install API + client dependencies

From the **repository root** (`diva/`):

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Start API + React together (easiest)

Still from **repository root** (install root deps once: `npm install` for `concurrently`):

```bash
npm run dev
```

- **App UI:** http://localhost:3000  
- **API:** http://localhost:4000  
- The browser talks to **`/api`**, which the dev server proxies to port 4000.

### 3. Or run client and server in two terminals

**Terminal A — API:**

```bash
cd server
npm install
node index.js
```

**Terminal B — React:**

```bash
cd client
npm install
npm start
```

### 4. Production-style run (single server, like deploy)

Build the client, then start Node in production mode (from **repo root**):

```bash
cd client && npm run build && cd ..
```

**PowerShell (Windows):**

```powershell
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$env:NODE_ENV = "production"
node server/index.js
```

Open **http://localhost:4000** (or the port in `$env:PORT`).  
Do **not** copy placeholder text like `<paste 32+ random chars>` — use a real secret **≥ 32 characters**.

---

## Authentication

- After login/signup, a **JWT** is stored in **`localStorage`** under **`diva_token`**.
- User profile cache: **`user`** in `localStorage` (updated when the app refreshes session from `/api/auth/me`).
- Protected routes use `AuthContext`; if the token is invalid, the app clears it on `/auth/me` failure.

---

## API client

All backend calls are in **`src/api/divaApi.js`** (`fetch` + JSON). Typical routes:

- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `/api/blogs`, `/api/blogs/drafts`, `/api/blogs/:id`, like/save endpoints
- `/api/questions`, replies, `/api/follows/*`, `/api/stories/*`
- `/api/users`, `/api/users/:id`, followers/following, etc.

Health check: **`GET /api/health`**.

---

## Build for production

```bash
cd client
npm run build
```

Output: **`client/build/`**. In production, the **server** in `server/index.js` can serve this folder and handle **`/api`** on the same host (see **`DEPLOY.md`** at repo root).

---

## Deploying the website

The **full stack** (React + API) is described in the parent folder’s **`DEPLOY.md`** (Render, Heroku, env vars, `MONGODB_URI`, `JWT_SECRET`).

**Short checklist:**

1. Set **`NODE_ENV=production`** and a strong **`JWT_SECRET`** (≥ 32 chars) on the host.
2. Build: `npm install --prefix server && cd client && npm ci && npm run build`
3. Start: `NODE_ENV=production node server/index.js` (platform sets **`PORT`**).
4. Do **not** set `REACT_APP_API_URL` if the API is on the **same domain** as the site.

HTTPS is provided by your host (e.g. Render), not by this repo’s Node process.

---

## Features (current)

- **Auth:** Sign up, sign in, JWT session, profile edit, password change, privacy toggle  
- **Explore:** Published blogs, likes, saves (server-backed)  
- **Create / drafts:** Blog editor, drafts list  
- **Forum:** Questions and replies  
- **Feed:** Stories, suggestions, friend requests (server-backed)  
- **Profile / user profiles:** Posts, followers, following, stories  
- **Resources, Chat, Contact, Home, Footer** links as in the app  

---

## Tech stack (client)

- React 18, React Router 6  
- Context API for auth  
- **`src/api/divaApi.js`** for backend communication  
- CSS (page/component styles)  

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| “Could not load posts” / API errors | Is **`server`** running on port **4000**? Is **`npm run dev`** or `node server/index.js` started? |
| CORS errors in dev | Use **`npm start`** with **`proxy`** and **no** wrong `REACT_APP_API_URL`, or point URL to the real API origin. |
| Login works locally but not after deploy | **`JWT_SECRET`** must be set in production and **stable** (changing it invalidates all tokens). |
| Data / connection errors | Set **`MONGODB_URI`** on the server; in Atlas check **Network Access** and the database user password (see **`DEPLOY.md`**). |

---

## Color palette (UI)

- **Primary:** `#ff69b4`  
- **Secondary / accent:** `#e91e63`, `#c2185b`  
- **Backgrounds:** `#fff`, `#f5f5f5`, light pinks for panels  
- **Text:** `#333`, `#666`  

---

## License

Part of the Diva project; same terms as the parent repository.
