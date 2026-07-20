# ==============================================================================
# YARE Panel Multi-Stage Production Dockerfile
# Stage 1: Build React SPA
# Stage 2: Build Go Backend with Embedded SPA
# Stage 3: Minimal Alpine Runtime
# ==============================================================================

# --- Stage 1: Build React SPA ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root and packages
COPY package.json ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Install dependencies and build SPA
RUN npm run setup
RUN cd apps/frontend && npm run build

# --- Stage 2: Build Go Backend ---
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/apps/backend

# Copy backend files
COPY apps/backend ./
# Copy built SPA to backend/dist for embedding
COPY --from=frontend-builder /app/apps/frontend/dist ./dist

# Compile standalone static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /opt/yare-backend main.go

# --- Stage 3: Lightweight Production Image ---
FROM alpine:3.19 AS runner

RUN apk add --no-cache ca-certificates tzdata sqlite curl bash

WORKDIR /opt/yare

# Copy backend binary from builder
COPY --from=backend-builder /opt/yare-backend /opt/yare/yare-backend

# Prepare data & config paths
RUN mkdir -p /opt/yare /etc/yare

# Expose Web Panel Port
EXPOSE 8080

# Environment variables
ENV PORT=8080 \
    ENV=production \
    DB_PATH=/opt/yare/yare.db \
    JWT_SECRET_FILE=/etc/yare/jwt.secret

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/opt/yare/yare-backend"]
