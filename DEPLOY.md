# Deploying Diva

The app is set up for **one public URL**: Node serves the API under `/api/*` and the React build for all other routes. HTTPS is provided by your host (Render, Railway, Fly.io, etc.).

## Environment variables

| Variable | Where | Required | Description |
|----------|--------|----------|-------------|
| `NODE_ENV` | Server | Yes (production) | Set to `production`. |
| `MONGODB_URI` | Server | Yes | MongoDB connection string (e.g. Atlas). Include the database name in the path, e.g. `...mongodb.net/diva?retryWrites=true&w=majority`. URL-encode special characters in the password. |
| `JWT_SECRET` | Server | Yes in production | At least **32** random characters. Generate locally: `openssl rand -base64 48` |
| `OPENAI_API_KEY` | Server | Optional (for AI chat) | API key for your LLM provider (Groq/OpenAI-compatible). |
| `OPENAI_MODEL` | Server | Optional (for AI chat) | Chat model name. For Groq example: `llama-3.1-8b-instant`. |
| `OPENAI_BASE_URL` | Server | Optional (for AI chat) | OpenAI-compatible base URL. Groq: `https://api.groq.com/openai/v1`. |
| `PORT` | Server | Usually automatic | Platforms set this (e.g. Render, Heroku). |
| `REACT_APP_API_URL` | **Build time** (client) | No | **Omit** for same-host deploy (recommended). Set only if the API lives on another domain (e.g. `https://api.example.com`). |
| `CLIENT_ORIGIN` | Server | Rare | Only for **split** deploy (static site + API). Set to your site origin, e.g. `https://app.example.com`. |
| `EMAIL_USER` | Server | Yes (for OTP) | The Gmail address used to send reset OTP emails (e.g. `preetikaanjana@gmail.com`). |
| `EMAIL_PASS` | Server | Yes (for OTP) | Google App Password (16 characters) created for Nodemailer. |

## Build and run (any VPS or container)

From the **repository root**:

```bash
cd server && npm ci
cd ../client && npm ci && npm run build
cd ..
set NODE_ENV=production
set MONGODB_URI=your-mongodb-connection-string
set JWT_SECRET=your-long-random-secret-at-least-32-chars
node server/index.js
```

On Linux/macOS use `export` instead of `set`. Or use `npm run start:prod` from the root after installing root devDependencies (`npm install` in root for `cross-env`).

## Render

1. New **Web Service**, connect this repo.
2. **Build command:**  
   `npm install --prefix server && cd client && npm ci && npm run build`
3. **Start command:**  
   `npm run start:prod`
4. Add **`MONGODB_URI`** (your Atlas or other MongoDB connection string; database name in the path, e.g. `/diva`).
5. Add environment variable **`JWT_SECRET`** (long random string). You can use Render’s “Generate” for a value, but it must be **≥ 32 characters**; if shorter, paste one from `openssl rand -base64 48`.
6. For AI chatbot on Groq, add:
   - `OPENAI_API_KEY=<your_groq_key>`
   - `OPENAI_BASE_URL=https://api.groq.com/openai/v1`
   - `OPENAI_MODEL=llama-3.1-8b-instant`

You can also use the included `render.yaml` Blueprint (adjust plan/disk as needed).

## Railway / Fly.io / similar

Same idea as Render: install server deps, build the client into `client/build`, run `NODE_ENV=production node server/index.js` (or `npm run start:prod` from root with `JWT_SECRET` set).

## Heroku

`Procfile` is included (`web: npm run start:prod`). Configure **`MONGODB_URI`** and **`JWT_SECRET`** in Config Vars.

## Split deployment (static + API)

1. Deploy the API on host A. Set a strong `JWT_SECRET`.
2. Build the client with:  
   `REACT_APP_API_URL=https://host-a.example.com`  
   then deploy the contents of `client/build` to static hosting (host B).
3. On the API server, set `CLIENT_ORIGIN=https://host-b.example.com` (no trailing slash).

## Data storage

The API persists data in **MongoDB** via `MONGODB_URI`. In Atlas, allow your host’s outbound IPs (or `0.0.0.0/0` for quick tests) in **Network Access**, and create a database user with read/write access.
