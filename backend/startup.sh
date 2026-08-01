#!/bin/sh
set -e

echo "=== Starting Backend ==="

# Generate Prisma client
npx prisma generate 2>&1
echo "✓ Prisma client generated"

# Run Prisma migrations
npx prisma db push --accept-data-loss 2>&1
echo "✓ Prisma migrations applied"

# Check if we're in production (dist folder exists) or development
if [ -d "./dist" ]; then
  echo "✓ Starting app with compiled JS (production)..."
  echo "   Port: ${PORT:-4000}"
  echo "   Node: $(node --version)"
  node dist/main.js 2>&1
  EXIT_CODE=$?
  echo "✗ App exited with code $EXIT_CODE"
  exit $EXIT_CODE
else
  echo "✓ Starting app with ts-node (development)..."
  npx ts-node -r tsconfig-paths/register src/main.ts 2>&1
fi