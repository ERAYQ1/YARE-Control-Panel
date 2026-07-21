#!/usr/bin/env bash
# ==============================================================================
# YARE Control Panel - Linux Standalone Executable Builder
# ==============================================================================

set -eo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}          YARE Control Panel - Linux Standalone Builder               ${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH!${NC}"
    echo "Please install Node.js 20+ (e.g. via nvm or apt install nodejs)"
    exit 1
fi

if ! command -v go &> /dev/null; then
    echo -e "${RED}[ERROR] Go is not installed or not in PATH!${NC}"
    echo "Please install Go 1.22+ from https://go.dev/"
    exit 1
fi

echo -e "${CYAN}[1/3] Installing monorepo dependencies...${NC}"
npm run setup

echo -e "${CYAN}[2/3] Building React Frontend SPA & copying assets...${NC}"
npm run build:frontend
node scripts/copy-dist.js

echo -e "${CYAN}[3/3] Compiling Go backend into single binary (yare-panel)...${NC}"
cd apps/backend
CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o ../../yare-panel main.go
cd ../..

chmod +x yare-panel

echo ""
echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN} [SUCCESS] YARE Control Panel Linux executable compiled!${NC}"
echo -e "${GREEN} Output File: ./yare-panel${NC}"
echo -e "${GREEN} Run with   : ./yare-panel${NC}"
echo -e "${GREEN}======================================================================${NC}"
