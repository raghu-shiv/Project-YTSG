# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package.json tsconfig.json nest-cli.json ./

# Install ALL dependencies (dev + prod) for building
RUN npm install && npm cache clean --force

# Copy source code
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client (generated in node_modules/@prisma/client)
RUN npx prisma generate

# Build the application
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl

# Copy production dependencies only (reinstall without dev deps)
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built artifacts and Prisma schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy the generated Prisma client from builder's node_modules
# This ensures the client matches the schema and is available at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the application
CMD ["sh", "./startup.sh"]