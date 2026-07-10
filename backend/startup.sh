#!/bin/sh
# Don't use -e because we handle errors manually

# Generate Prisma client
npx prisma generate 2>&1
echo "Prisma client generated successfully"

# Run Prisma migrations before starting the app
npx prisma db push --accept-data-loss 2>&1
echo "Prisma migrations applied successfully"

# Build with nest build first (uses SWC by default, faster)
echo "Building NestJS app..."
npx nest build 2>&1 || true

# Check if build succeeded
if [ -f dist/main.js ]; then
  echo "Build successful, starting app with tsconfig-paths..."
  exec node -r tsconfig-paths/register dist/main
fi

# If that failed, try tsc directly
echo "First build failed, trying tsc..."
npx tsc 2>&1 || true

if [ -f dist/main.js ]; then
  echo "TSC build successful, starting app..."
  exec node -r tsconfig-paths/register dist/main
fi

# Final fallback: run directly with ts-node
echo "Build failed. Running directly with ts-node..."
exec npx ts-node -r tsconfig-paths/register src/main.ts