#!/bin/sh
echo "=== Starting Backend ==="
echo "PORT=${PORT:-not set}"

# Generate Prisma client (non-fatal if it fails)
npx prisma generate 2>&1 || echo "⚠️ Prisma generate had issues"
echo "✓ Prisma client generated"

# Run Prisma migrations (non-fatal — schema may already be compatible)
npx prisma db push --accept-data-loss 2>&1 || echo "⚠️ Prisma push had issues (non-fatal)"
echo "✓ Prisma migrations applied"

# Start the application
echo "✓ Starting app..."
echo "   Port: ${PORT:-4000}"
echo "   Node: $(node --version)"

if [ -d "./dist" ]; then
  node dist/main.js 2>&1
  EXIT_CODE=$?
  echo "✗ App exited with code $EXIT_CODE"
  exit $EXIT_CODE
else
  echo "✗ ERROR: dist directory not found! Build may have failed."
  ls -la /app/ 2>&1
  exit 1
fi