.PHONY: help setup dev build docker-build docker-up docker-down clean

help:
	@echo "YARE Control Panel Commands:"
	@echo "  make setup        - Install node dependencies for monorepo and apps"
	@echo "  make dev          - Start frontend & backend concurrently"
	@echo "  make build        - Compile React SPA & Go production binary"
	@echo "  make docker-up    - Start YARE Panel via Docker Compose"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make clean        - Clean build artifacts"

setup:
	npm run setup

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
	rm -rf apps/frontend/dist apps/backend/dist apps/backend/bin
