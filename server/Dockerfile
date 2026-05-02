# Election Assistant Backend - Cloud Run Deployment
# Built with Google Antigravity & Vertex AI

FROM node:20-slim AS builder

WORKDIR /app

# Copy shared types (project root)
COPY shared/ ./shared/

# Copy server source and shared re-export
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src/ ./server/src/
COPY server/shared/ ./server/shared/

# Install ALL dependencies (including devDependencies for TypeScript build)
WORKDIR /app/server
RUN npm ci && npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Security: run as non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server/src/index.js"]
