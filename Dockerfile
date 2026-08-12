# KyyStatus HD Dockerfile
# Multi-stage build for production

# Stage 1: Build frontend
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy package files
COPY client/package.json client/package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY client/ .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy package files
COPY server/package.json server/package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY server/ .

# Build backend
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

# Install ffmpeg (required for video compression)
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Create data directories
RUN mkdir -p /data/sessions /data/storage /data/temp

# Copy built files
COPY --from=client-builder /app/client/dist ./client-dist
COPY --from=server-builder /app/server/dist ./server-dist
COPY --from=server-builder /app/server/package.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV SESSION_DIR=/data/sessions
ENV STORAGE_DIR=/data/storage
ENV TEMP_DIR=/data/temp
ENV CORS_ORIGIN=*

# Expose port
EXPOSE 3000

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set permissions
RUN chown -R appuser:appgroup /data /app

# Start server
CMD ["node", "./server-dist/server.js"]
