# YARE Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3%2Fv4-38BDF8.svg)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![Languages](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald)](https://github.com/yare-panel/yare)

**YARE Panel** is an open-source, lightweight, modular, modern server management platform. Designed with Vercel/Supabase-level developer craft aesthetics, high performance, and OWASP-grade security, YARE Panel aims to be the first application installed on any fresh Linux server.

> **Note**: This is NOT a hosting panel or another cPanel clone. It is a universal server management platform.

---

## ✨ Core Highlights & Features

- ⚡ **High Performance & Low Footprint**: Go (Gin) backend with SQLite embedded database. Idle memory usage is under 30MB.
- 🎨 **Vercel / Supabase Craft Aesthetics**: Obsidian black palette (`#09090b`), sharp 1px borders, zero AI gradient clutter, and technical monospace typography.
- 🌍 **3-Language Support (i18n)**: Seamless dynamic switching between **Türkçe 🇹🇷**, **English 🇬🇧**, and **Deutsch 🇩🇪**.
- ⌨️ **Global Command Palette (`⌘K`)**: Instant search overlay to navigate anywhere across pages, services, commands, and docker stacks.
- 🛡️ **Enterprise Security (OWASP)**: Rate limiting (120 req/min), OWASP security headers (`CSP`, `HSTS`, `X-Frame-Options`), JWT token refresh rotation, and RBAC rules.
- 📊 **Realtime Telemetry Dashboard**: Live CPU, Memory, Disk, and Network bandwidth charts over WebSockets.
- 💻 **Web Terminal**: Multi-tab PTY terminal interface with interactive shell streaming.
- 📁 **File Manager**: Tree/Grid file browser, drag-and-drop uploads, built-in code editor modal, and permissions (`chmod`) editor.
- 🐳 **Docker Engine**: Containers, Images, Volumes, Networks, and Docker Compose stack management.
- ⚙️ **Systemd Services Manager**: Start, stop, restart, enable, disable, and view `journalctl` service logs.
- 🔌 **Modular Plugin System**: Extensible plugin lifecycle handlers (`Install`, `Enable`, `Disable`, `Remove`).

---

## 🖥️ Supported Operating Systems

- **Ubuntu** 24+
- **Debian** 13+
- **Fedora**
- **Rocky Linux**
- **AlmaLinux**
- *(Upcoming: Arch Linux, OpenSUSE)*

---

## ⚡ One-Command Installation

Install YARE Panel on your Linux server with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/yare-panel/yare/main/install/install.sh | bash
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
