#!/data/data/com.termux/files/usr/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  (cd "$ROOT/backend" && npm install)
fi
if [ ! -f "$ROOT/backend/.env" ]; then
  echo "Create backend/.env from backend/.env.example and set DATABASE_URL first."
  exit 1
fi
set -a
. "$ROOT/backend/.env"
set +a
(cd "$ROOT/backend" && npm start) > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT
sleep 1
export FM_ONLINE_API="http://127.0.0.1:${PORT:-8787}/api"
node "$ROOT/server.mjs" &
FRONTEND_PID=$!
trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true' EXIT
wait "$FRONTEND_PID"
