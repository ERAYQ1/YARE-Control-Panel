.PHONY: help setup check-go dev build docker-build docker-up docker-down clean

help:
	@echo "YARE Control Panel Commands:"
	@echo "  make setup        - Install dependencies & tidy Go modules"
	@echo "  make dev          - Start frontend & backend concurrently"
	@echo "  make build        - Compile React SPA & Go production binary"
	@echo "  make docker-up    - Start YARE Panel instantly via Docker Compose"
	@echo "  make docker-down  - Stop Docker containers"
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
	npm run build

docker-build:
	npm run docker:build

docker-up:
	npm run docker:up

docker-down:
	npm run docker:down

clean:
	rm -rf apps/frontend/dist apps/backend/dist apps/backend/bin yare-panel.exe yare-panel
