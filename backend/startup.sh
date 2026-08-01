#!/bin/sh
echo "=== Starting Backend ==="
echo "PORT=${PORT:-not set}"

# Generate Prisma client
npx prisma generate 2>&1
echo "✓ Prisma client generated"

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
  echo "✗ ERROR: dist directory not found!"
  ls -la /app/ 2>&1
  exit 1
fi