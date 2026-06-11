#!/bin/sh
set -e

echo "[AudioSpace] Pushing database schema..."
npx prisma@5 db push --accept-data-loss

echo "[AudioSpace] Seeding database..."
npx --yes tsx prisma/seed.ts || echo "[AudioSpace] Seed skipped (may already exist or fail)"

echo "[AudioSpace] Starting application..."
exec "$@"
