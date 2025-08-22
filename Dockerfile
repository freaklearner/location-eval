# Multi-stage build for Location Evaluation Tool
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY src/ ./src/
COPY public/ ./public/

# Install frontend dependencies
RUN npm ci --only=production

# Build the React app
RUN npm run build

# Backend builder stage
FROM node:18-alpine AS backend-builder

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/src/ ./src/

# Install backend dependencies
RUN npm ci --only=production

# Build the NestJS app
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy backend build and node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package.json ./backend/package.json

# Copy backend config files
COPY --chown=nodejs:nodejs backend/src/config/ ./backend/src/config/

# Copy frontend build
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/build ./frontend/build

# Install serve to serve frontend files
RUN npm install -g serve

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start script
CMD ["dumb-init", "sh", "-c", "cd /app/frontend && serve -s build -l 3000 & cd /app/backend && node dist/main.js"]
