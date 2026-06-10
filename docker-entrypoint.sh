#!/bin/sh
set -e

echo "[AudioSpace] Running database migrations..."
npx prisma migrate deploy

echo "[AudioSpace] Seeding database..."
node prisma/seed.js || echo "[AudioSpace] Seed skipped (may already exist)"

echo "[AudioSpace] Starting application..."
exec "$@"
