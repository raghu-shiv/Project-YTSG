#!/bin/sh

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
  exec node dist/main.js
else
  echo "✓ Starting app with ts-node (development)..."
  exec npx ts-node -r tsconfig-paths/register src/main.ts
fi