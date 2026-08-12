# KyyStatus HD Server Dockerfile
FROM node:20-alpine AS production

# Install ffmpeg (required for video compression)
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Create data directories
RUN mkdir -p /data/sessions /data/storage /data/temp

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built files
COPY dist/ ./dist/

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
CMD ["node", "./dist/server.js"]
