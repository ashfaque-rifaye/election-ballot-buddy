# Election Assistant Backend - Cloud Run Deployment
# Built with Google Antigravity & Vertex AI

FROM node:20-slim AS builder

WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Copy server source
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src/ ./server/src/

# Install dependencies and build
WORKDIR /app/server
RUN npm ci --only=production && npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./

# Security: run as non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
