# Club Empire Online Backend

Real online accounts, sessions, rooms, shared-world state and live room events.

## Database

Use a PostgreSQL database (Neon is recommended). Run `schema.sql` once. The schema stores users, hashed passwords, sessions, rooms and multiplayer world state.

## Local

```bash
cd backend
npm install
cp .env.example .env
# edit DATABASE_URL and APP_ORIGIN
node server.mjs
```

Frontend can point at it with:

```js
localStorage.setItem('FM_ONLINE_API', 'http://localhost:8787/api')
```

## Production

Deploy the backend to a Node host (Railway/Render/Fly/etc.) or adapt the routes to your preferred serverless setup. Set `DATABASE_URL` and `APP_ORIGIN` in production. Never commit `.env` or passwords.

The frontend polls room state as a reliability fallback and also receives Server-Sent Events for fast updates. World updates use optimistic versioning so two managers cannot silently overwrite each other.
