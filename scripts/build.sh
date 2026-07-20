#!/usr/bin/env bash
# ==============================================================================
# YARE Panel Monorepo Build Script
# Builds frontend SPA and embeds/compiles binary with Go
# ==============================================================================

set -eo pipefail

echo "==> Building Frontend SPA..."
cd apps/frontend
npm run build

echo "==> Copying Frontend dist to Go embed location..."
mkdir -p ../backend/dist
cp -r dist/* ../backend/dist/

echo "==> Building Go Production Binary..."
cd ../backend
go build -ldflags="-s -w" -o bin/yare-backend main.go

echo "==> Build complete! Binary available at apps/backend/bin/yare-backend"
