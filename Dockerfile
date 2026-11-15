# ==========================================
# Kiru Leathers Production Dockerfile
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install native tools if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install frontend deps
COPY package*.json ./
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install build tools for native Node addons (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy built frontend assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy backend server code
COPY server ./server

EXPOSE 5000

CMD ["node", "server/server.js"]
