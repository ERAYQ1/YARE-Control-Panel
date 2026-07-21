# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/ERAYQ1/YARE-Control-Panel/actions)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel** is a modern, high-performance, enterprise-grade open-source server management platform designed to manage Linux servers and local environments securely, effortlessly, and without overhead. Crafted with an Obsidian Black dark aesthetic inspired by Vercel and Supabase, YARE compiles into a single self-contained Go executable with embedded React SPA assets (`embed.FS`). It deploys in seconds with zero runtime dependencies.

---

## ⚡ Quick Start (Zero-Frustration Installation)

Choose the installation method that best suits your setup:

### 🐳 1️⃣ Docker Compose (Fastest & Recommended)

No Node.js, Go, or external toolchain required. If Docker is installed on your machine, launch YARE with **a single command**:

```bash
# Clone the repository
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel

# Run in background via Docker Compose
docker compose up -d
```

- 🌐 **Dashboard Access**: `http://localhost:8080` (or `http://<server-ip>:8080`)
- 🛑 **Stop Service**: `docker compose down`

---

### 🐧 2️⃣ Linux One-Command Installer (Curl Script)

Install automatically on any **Ubuntu 22+, Debian 12+, Fedora, Arch, or AlmaLinux** server. Running with root privileges configures a systemd daemon (`yare.service`) and firewall ports (`8080`). Non-root installations install locally to `~/.yare`. If Go is not present, the installer downloads Go 1.22.5 and builds from source automatically:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

> **What does the installer script do?**
> 1. Detects system architecture (`amd64` / `arm64`) and Linux distribution.
> 2. Downloads pre-compiled standalone binary from GitHub Releases (with automatic local Go 1.22.5 build fallback).
> 3. Registers `/etc/systemd/system/yare.service`, enables auto-start, and opens firewall port `8080` (UFW / FirewallD).

---

### 🚀 3️⃣ Portable Single Executable (.exe / Binary)

Run YARE without any development tools or installation steps:

1. Download the pre-compiled binary for your OS from [GitHub Releases](https://github.com/ERAYQ1/YARE-Control-Panel/releases):
   - **Windows**: `yare-panel.exe` (or `yare-panel-windows-amd64.exe`)
   - **Linux**: `yare-panel-linux-amd64`
   - **macOS**: `yare-panel-darwin-amd64` / `yare-panel-darwin-arm64`
2. Make it executable and run:
   ```bash
   # Linux / macOS
   chmod +x yare-panel-linux-amd64
   ./yare-panel-linux-amd64
   ```
   ```cmd
   :: Windows (CMD)
   .\yare-panel.exe
   ```
3. Open **`http://localhost:8080`** in your browser!

---

### 🛠️ 4️⃣ Local Development Setup (From Source)

To contribute or develop with hot-reload enabled:

#### 🪟 Windows:
```cmd
:: Install dependencies and launch dev servers
.\start.bat

:: Or build a single standalone yare-panel.exe:
.\build-win.bat
```

#### 🐧 Linux / 🍎 macOS:
```bash
# 1. Install monorepo dependencies
make setup

# 2. Start Frontend (Vite) & Backend (Go) concurrently
make dev

# 3. Compile standalone production binary
make build
```

- 🎨 **Frontend Dev URL**: `http://localhost:5173`
- ⚡ **Backend API URL**: `http://localhost:8080`

---

## 🔑 Default Credentials & Initial Security

Access the panel after installation:

- **Dashboard URL**: `http://localhost:8080`
- **Default Username**: `admin`
- **Default Password**: `admin123`

> 🛡️ **Security Alert**: The system flags default `admin:admin123` credentials on first login. Update your password in **Settings -> Account** after logging in.

---

## ✨ Enterprise Features & Capabilities

- 🌐 **Domain Reverse Proxy & SSL**: Configure proxy hosts, SSL auto-renewal readiness, and export clean Nginx configurations with 1 click.
- ⏰ **Visual Cron Job Manager**: Create, schedule, toggle, and trigger background system tasks with live execution status audit.
- 📦 **Backup & Disaster Recovery**: Create automated `.tar.gz` compressed system/directory backups with 1-click browser download and deletion.
- 🔔 **Multi-Channel Alert Engine**: Send instant alerts via Telegram, Discord, Slack, and generic Webhooks with live test notifications.
- 🛡️ **Security Audit Trail**: Detailed, searchable activity log recording username, IP address, action, and timestamps.
- 🐳 **1-Click Docker App Catalog**: Instantly deploy PostgreSQL, Redis, Vaultwarden, MinIO S3, Grafana, Cloudflare Tunnel, n8n, Nextcloud, and Portainer CE.
- 🚀 **Single Standalone Binary (`embed.FS`)**: React SPA is embedded directly into the Go executable. Zero Node.js runtime required on servers!
- ⚡ **Ultra-Low Resource Usage**: SQLite WAL mode engine consuming under 30MB RAM at idle.
- 🎨 **Obsidian Black UX**: Modern UI designed with Tailwind CSS, Lucide icons, glassmorphism, and smooth micro-animations.
- 🌍 **Multilingual (i18n)**: Instant dynamic language switching between English 🇬🇧, Turkish 🇹🇷, and German 🇩🇪.

---

## ⚙️ Environment Variables

Customize YARE Control Panel behavior:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | HTTP listening port |
| `ENV` | `production` | Execution environment (`development` or `production`) |
| `DB_PATH` | `/opt/yare/yare.db` | SQLite database file storage path |
| `JWT_SECRET` | *(Auto-generated)* | Secret key for signing JWT tokens (32+ chars) |

---

## 🔧 Linux Service Management

For Linux installations running via Systemd:

```bash
# Check service status
systemctl status yare.service

# Restart or Stop service
systemctl restart yare.service
systemctl stop yare.service

# View live system logs
journalctl -u yare.service -f --no-pager
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
