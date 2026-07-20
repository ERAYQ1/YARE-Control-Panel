#!/usr/bin/env bash
# ==============================================================================
# YARE Panel Production Monorepo Build Pipeline
# Bundles React SPA into Go single self-contained binary
# ==============================================================================

set -eo pipefail

echo "==> [1/3] Building React Frontend SPA..."
cd apps/frontend
npm run build

echo "==> [2/3] Embedding Frontend Assets into Go Backend..."
mkdir -p ../backend/dist
cp -r dist/* ../backend/dist/

echo "==> [3/3] Compiling Go Production Binary..."
cd ../backend
go mod tidy
go build -ldflags="-s -w" -o bin/yare-backend main.go

echo "==> Build Successful! Production binary available at apps/backend/bin/yare-backend"
