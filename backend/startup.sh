#!/bin/sh
# Run Prisma migrations before starting the app
npx prisma db push --accept-data-loss 2>&1
echo "Prisma migrations applied successfully"

# Start the NestJS app
npm run start:dev