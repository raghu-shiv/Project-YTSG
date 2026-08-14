#!/bin/sh
set -e
echo "=== Starting Backend ==="
echo "PORT=${PORT:-not set}"
echo "DIRECT_URL=${DIRECT_URL:+set (hidden)}"

# Generate Prisma client
npx prisma generate 2>&1
echo "✓ Prisma client generated"

# Apply schema to database
# ─────────────────────────────────────────────────────────────────────────────
# Production:  prisma migrate deploy  — applies committed migrations safely.
#              Will NOT create missing tables or mutate the DB destructively.
# Development: prisma db push         — pushes schema directly (may reset data
#              with --accept-data-loss for local convenience only).
if [ "$NODE_ENV" = "production" ]; then
  echo "→ Running production migrations (migrate deploy)..."
  echo "   (Using DIRECT_URL if set to bypass PgBouncer for DDL operations)"
  if [ -n "$DIRECT_URL" ]; then
    timeout 120 npx prisma migrate deploy --skip-generate 2>&1
  else
    echo "   ⚠ DIRECT_URL not set — migrations may fail with PgBouncer"
    timeout 120 npx prisma migrate deploy --skip-generate 2>&1
  fi
  PRISMA_EXIT=$?
  if [ $PRISMA_EXIT -ne 0 ]; then
    echo "✗ Migration failed with exit code $PRISMA_EXIT"
    if [ $PRISMA_EXIT -eq 124 ]; then
      echo "  (Command timed out after 120s — check your database connection)"
    fi
    exit $PRISMA_EXIT
  fi
  echo "✓ Migrations applied"
else
  echo "→ Development mode: pushing schema to database..."
  echo "   (Using DIRECT_URL if set to bypass PgBouncer for DDL operations)"
  if [ -n "$DIRECT_URL" ]; then
    timeout 120 npx prisma db push --accept-data-loss --skip-generate 2>&1
  else
    echo "   ⚠ DIRECT_URL not set — schema push may fail with PgBouncer"
    timeout 120 npx prisma db push --accept-data-loss --skip-generate 2>&1
  fi
  PRISMA_EXIT=$?
  if [ $PRISMA_EXIT -ne 0 ]; then
    echo "✗ Schema push failed with exit code $PRISMA_EXIT"
    if [ $PRISMA_EXIT -eq 124 ]; then
      echo "  (Command timed out after 120s — check your database connection)"
    fi
    exit $PRISMA_EXIT
  fi
  echo "✓ Schema push complete"
fi

echo "✓ Starting app..."
echo "   Port: ${PORT:-4000}"
echo "   Node: $(node --version)"

# Production: dist exists (from Docker build), Dev: use ts-node
if [ -d "./dist" ]; then
  node dist/main.js 2>&1
  EXIT_CODE=$?
  echo "✗ App exited with code $EXIT_CODE"
  exit $EXIT_CODE
elif [ -f "./src/main.ts" ]; then
  npx ts-node src/main.ts 2>&1
  EXIT_CODE=$?
  echo "✗ App exited with code $EXIT_CODE"
  exit $EXIT_CODE
else
  echo "✗ ERROR: Neither dist/ nor src/ found!"
  ls -la /app/ 2>&1
  exit 1
fi