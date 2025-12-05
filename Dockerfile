# Multi-stage build for fullstack application with backend metrics

# Stage 1: Build the React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Stage 2: Production stage with Node.js backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend server
COPY server ./server

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start the backend server
CMD ["node", "server/index.js"]
