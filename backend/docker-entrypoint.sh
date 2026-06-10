#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
node migrations/migrate.js

echo "[entrypoint] Starting application..."
exec "$@"
