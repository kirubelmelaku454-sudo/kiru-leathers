# ==========================================
# Kiru Leathers Production Dockerfile
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build frontend (TypeScript + Vite)
COPY . .
RUN npm run build

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy server code
COPY server ./server

# Expose port
EXPOSE 5000

# Start unified server
CMD ["node", "server/server.js"]
