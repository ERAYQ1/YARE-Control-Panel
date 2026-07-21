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

echo "==> [3/3] Compiling Go Production Binary (yare-panel)..."
cd ../backend
go mod tidy
CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o ../../yare-panel main.go

echo "==> Build Successful! Standalone production binary available at ./yare-panel"
