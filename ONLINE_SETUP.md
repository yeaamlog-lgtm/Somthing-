# Club Empire — Real Online Multiplayer

This build includes a **real persistent multiplayer backend**. It is not browser-only imitation: authentication, rooms, session state, world versioning and multiplayer actions live on the server/database.

## Architecture

`Football OS client` → `HTTP API + SSE` → `Node.js backend` → `PostgreSQL`

The server owns the shared room world. Clients submit typed actions with a world version. The server validates the action, writes the new world, increments the version and broadcasts the update.

## Features

- Account creation and sign-in
- Secure password hashing with Node `scrypt`
- HttpOnly persistent sessions
- Create/join rooms with shareable room codes
- Up to 8 human managers per room
- Persistent shared-world JSON state
- Server-authoritative multiplayer actions
- Version conflicts rejected instead of silently overwriting a friend's changes
- World action audit log
- Server-Sent Events for live updates + polling fallback
- Club assignment, tactics, line-up, transfer-offer and world-advance action protocol
- AI-manager slots can be added to the same room/world

## 1. PostgreSQL

Use any PostgreSQL provider. Neon works well for Vercel deployments.

Run:

```bash
psql "$DATABASE_URL" -f backend/schema.sql
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set:

```env
DATABASE_URL=postgresql://...
APP_ORIGIN=http://localhost:8088
PORT=8787
SESSION_DAYS=30
```

Then:

```bash
npm start
```

The API runs at `http://localhost:8787`.

## 3. Frontend

From the project root:

```bash
FM_ONLINE_API=http://localhost:8787/api node server.mjs
```

If the browser server does not pass environment variables to the page, set the API once in Chrome DevTools:

```js
localStorage.setItem('FM_ONLINE_API','http://localhost:8787/api'); location.reload();
```

## 4. Play with friends

1. Open the game.
2. Click **ONLINE**.
3. Create an account/sign in.
4. Create a world.
5. Send the displayed **ROOM CODE** to friends.
6. Friends sign in and choose **JOIN FRIENDS**.
7. Everyone appears in the same server-side world.

## Production deployment

Deploy the backend to a Node-capable persistent host and configure:

- `DATABASE_URL`
- `APP_ORIGIN=https://your-game-domain.example`
- `SESSION_DAYS`

Then configure the frontend to use:

`https://your-backend-domain.example/api`

Do not put `DATABASE_URL` or any session secret in frontend JavaScript.

## Server-authoritative scope

The multiplayer protocol is deliberately action-based. The browser does **not** get permission to replace the authoritative world with an arbitrary client JSON blob.

Current server actions:

- `SET_CLUB`
- `SET_TACTICS`
- `SET_LINEUP`
- `TRANSFER_OFFER`
- `TRANSFER_CANCEL`
- `ADVANCE_DAY`
- `POST_NEWS`

For a fully competitive production league, the next server-authoritative layer should move the existing match simulation, fixture resolution, transfer acceptance, finances and AI-manager tick to the backend as deterministic services/jobs. The protocol is already structured so those systems can be added without turning multiplayer into fake local synchronization.
