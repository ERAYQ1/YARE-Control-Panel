.PHONY: help setup check-go dev build clean

help:
	@echo "YARE Control Panel Commands:"
	@echo "  make setup        - Install dependencies & tidy Go modules"
	@echo "  make dev          - Start frontend & backend concurrently"
	@echo "  make build        - Compile React SPA & Go production binary"
	@echo "  make clean        - Clean build artifacts"

check-go:
	@which go > /dev/null 2>&1 || (echo "[INFO] Go is not installed. Installing Go 1.22.5 locally..." && \
		curl -fsSL https://go.dev/dl/go1.22.5.linux-amd64.tar.gz -o /tmp/go.tar.gz && \
		mkdir -p $(HOME)/.go && tar -C $(HOME)/.go -xzf /tmp/go.tar.gz && \
		rm -f /tmp/go.tar.gz)

setup:
	npm run setup
	@cd apps/backend && go mod tidy || true

dev:
	npm run dev

build:
	npm run build:frontend
	node scripts/copy-dist.js
	cd apps/backend && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o ../../yare-panel main.go

clean:
	rm -rf apps/frontend/dist apps/backend/dist apps/backend/bin yare-panel.exe yare-panel
