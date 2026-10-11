# Club Empire — Integrated Football Manager

This package combines the existing Football Manager ULTIMATE PREMIUM game with the Club Empire online-league identity and the included PostgreSQL multiplayer backend. The original vanilla HTML/CSS/JavaScript game and its match engine remain the primary game, so the existing career, squads, tactics, transfer market, academy, competitions and save system are preserved.

## What is connected

- The main game is rebranded as **Club Empire** in browser metadata and the online panel.
- The existing online panel provides sign-up/sign-in, create-world, join-by-room-code, shared room state, server version checks, live Server-Sent Events and polling fallback.
- The backend persists accounts, sessions, room membership, shared world state and action audit history in PostgreSQL.
- On a local Termux run (`http://localhost:8088`), the online panel now automatically targets `http://localhost:8787/api`.
- To override the endpoint, set `localStorage.setItem('CLUB_EMPIRE_API', 'https://YOUR-BACKEND-DOMAIN/api')` in the browser console and reload.

## Run locally on Android / Termux

1. Install Node.js and PostgreSQL access tools in Termux. You can use a hosted PostgreSQL database such as Neon instead of running PostgreSQL on the phone.
2. Unzip the project and enter its folder.
3. Configure the backend:

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection string and `APP_ORIGIN=http://localhost:8088` in `backend/.env`, then initialize the schema:

```bash
psql "$DATABASE_URL" -f schema.sql
npm start
```

In a second Termux session, from the project root:

```bash
node server.mjs
```

Open `http://localhost:8088`, tap **ONLINE**, create an account, create a world, and share the room code with friends. For friends on different devices, the frontend and backend must both be deployed to public HTTPS URLs; localhost only works on your own phone.

## Production deployment

- **Frontend:** deploy the static game files to Vercel.
- **Backend:** deploy `backend/` to a persistent Node.js host such as Railway or Render. Configure `DATABASE_URL`, `APP_ORIGIN` (the exact public frontend origin), `PORT` if required, and `SESSION_DAYS`. Apply `backend/schema.sql` to the database once.
- Set the frontend API override to `https://YOUR-BACKEND-DOMAIN/api`. If frontend and backend are on different origins, the backend's CORS origin must exactly match the frontend origin.
- Keep `.env` files and database credentials private. Never put `DATABASE_URL` in browser JavaScript.

## Important current scope

This is an integration of the supplied project, not a claim that every single-player feature has already become a server-authoritative multiplayer feature. Online accounts, rooms, room membership, versioned shared-world actions and persistence are present in the backend. The existing local career save and detailed match engine still run in the browser; competitive league fixtures, transfers, finances and match outcomes need further migration to the backend before they can be considered cheat-resistant across a full online league.

Player data already in the supplied game should be treated as the project's included dataset, not as a claim of official licensing or guaranteed current real-world squad accuracy.

## Included files

- `index.html`, `style.css`, `js/` — main responsive game and match engine
- `backend/server.mjs` — Node HTTP API, account sessions, room operations and live room events
- `backend/schema.sql` — PostgreSQL persistence schema
- `run-termux.sh`, `run-online-termux.sh` — local run helpers
- `.env.example`, `ONLINE_SETUP.md` — configuration guidance
