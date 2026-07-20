# YARE Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3%2Fv4-38BDF8.svg)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![Languages](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Panel** is an open-source, lightweight, modular, modern server management platform. Built with Vercel/Supabase-level developer craft aesthetics, high performance, and OWASP-grade security, YARE Panel aims to be the first application installed on any fresh Linux server.

> **Note**: This is NOT a hosting panel or another cPanel clone. It is a universal server management platform.

---

## ✨ Production Linux Installation & Architecture Audit

- 🚀 **Single Self-Contained Binary**: The React SPA is compiled & embedded directly into the Go executable via `embed.FS`. Production Linux nodes need **zero Node.js or npm dependencies**—just one standalone binary!
- 🛡️ **Automated Linux Security & Firewall**: `install.sh` generates a 64-character random JWT secret (`/etc/yare/jwt.secret`), sets 600 file permissions, opens UFW/firewalld port `8080`, and registers a systemd restart daemon (`yare.service`).
- ⚡ **High Performance & Low Memory**: Go (Gin) backend with embedded SQLite database (`yare.db`). Idle memory footprint is under 30MB.
- 🎨 **Vercel / Supabase Craft Aesthetics**: Obsidian black palette (`#09090b`), sharp 1px borders, zero AI gradient clutter, and technical monospace typography.
- 📦 **1-Click App Catalog & Reverse Proxy**: Deploy 1-click Docker stacks (PostgreSQL, Redis, Ollama AI, n8n, Nextcloud) & manage Nginx/Caddy proxy domains with Let's Encrypt SSL.
- 🏛️ **Multi-Node Swarm Cluster**: Manage multiple remote cloud VPS instances (Hetzner, AWS, HomeLab) from a single control plane over mTLS.
- 🤖 **AI Copilot & Self-Healing Playbooks**: Natural language server diagnostics & automated remediation triggers (e.g. disk auto-prune, brute-force IP ban).
- 🌍 **3-Language Support (i18n)**: Seamless dynamic switching between **Türkçe 🇹🇷**, **English 🇬🇧**, and **Deutsch 🇩🇪**.
- ⌨️ **Global Command Palette (`⌘K`)**: Instant search overlay to navigate anywhere across pages, services, commands, and docker stacks.

---

## 🖥️ Supported Operating Systems & Architectures

- **Ubuntu** 24+
- **Debian** 13+
- **Fedora**
- **Rocky Linux**
- **AlmaLinux**
- **Arch Linux**
- **Architectures**: `x86_64` (amd64), `aarch64` (arm64), `armv7l`

---

## ⚡ One-Command Production Linux Installation

Install YARE Panel on your Linux server with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

Once installed, access the dashboard at: `http://<your-server-ip>:8080`

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 20+ & npm
- Go 1.22+

### Running Frontend
```bash
cd apps/frontend
npm install
npm run dev
```
Dev server will run at `http://localhost:5173`.

### Running Backend (Cross-Platform Emulation & Native Linux)
```bash
cd apps/backend
go run main.go
```
API server will run at `http://localhost:8080`.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
