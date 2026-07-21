# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/ERAYQ1/YARE-Control-Panel/actions)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel** is a modern, high-performance, open-source Linux server management platform built with Go and React. Designed with an obsidian dark aesthetic inspired by Vercel and Supabase, YARE compiles into a single self-contained binary embedding frontend static assets (`embed.FS`). It operates with an ultra-lightweight SQLite WAL database engine consuming less than 30MB RAM at idle.

---

## ⚡ Quick Start (Installation)

Choose your preferred installation method:

### 🐳 1. Docker Compose (Fastest & Recommended)

Run YARE in background via Docker without installing Go or Node.js locally:

```bash
# Clone repository
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel

# Start container in detached mode
docker compose up -d
```

- **Dashboard Access**: `http://localhost:8080` (or `http://<server-ip>:8080`)
- **Stop Service**: `docker compose down`

---

### 🐧 2. Linux One-Command Installer (Curl Script)

Automatic setup for **Ubuntu 20.04+, Debian 11+, AlmaLinux 8+, Fedora 36+, or Arch Linux**. Running with root configures a systemd daemon (`yare.service`) and opens firewall port `8080`:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

> **What the installer script does:**
> 1. Detects system architecture (`amd64` / `arm64`) and OS distribution.
> 2. Downloads pre-compiled standalone binary or builds locally if Go 1.22+ is present.
> 3. Registers `/etc/systemd/system/yare.service`, enables auto-start, and configures firewall rules (UFW / FirewallD).

---

### 🚀 3. Standalone Binary Execution

Download the compiled executable from [GitHub Releases](https://github.com/ERAYQ1/YARE-Control-Panel/releases):

```bash
# Linux
chmod +x yare-panel-linux-amd64
./yare-panel-linux-amd64
```

```cmd
:: Windows (CMD)
.\yare-panel.exe
```

Access the panel at **`http://localhost:8080`**.

---

### 🛠️ 4. Build From Source

To build the project locally from source:

```bash
# 1. Clone repository
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel

# 2. Build Frontend static assets
cd apps/frontend
npm install
npm run build

# 3. Copy dist to backend embed directory and compile backend
cd ../backend
go test ./...
go build -o yare-panel main.go

# 4. Run binary
./yare-panel
```

---

## 🔑 Initial Configuration & Default Credentials

After launching YARE, open `http://localhost:8080` in your browser:

- **Default Username**: `admin`
- **Default Password**: `admin123`

> 🛡️ **Mandatory First-Login Password Change**: The system enforces an immediate password change prompt upon logging in with default credentials.

---

## ✨ Features & Capabilities

- 📊 **Real-Time System Dashboard**: Live metrics for CPU usage, RAM allocation, disk capacity, system load average, uptime, and running processes.
- 🏪 **App Store & 1-Click Catalog**: Curated deployment of PostgreSQL, Redis, Vaultwarden, MinIO S3, Grafana, Cloudflare Tunnel, n8n, Nextcloud, and Portainer CE, alongside custom GitHub repository inspection.
- 🐳 **Docker Container Manager**: Start, stop, restart, remove containers, view container logs, and inspect Docker images, volumes, and networks.
- ⚙️ **System Services Manager**: Inspect, start, stop, and restart systemd service daemons directly from the web interface.
- 📁 **Visual File Manager**: Browse filesystem, view and edit files in code editor, upload files, delete items, create directories, and compress directories to `.zip`.
- 💻 **Web Terminal**: Full interactive WebSocket terminal shell powered by `xterm.js`.
- 🌐 **Reverse Proxy & Domain Manager**: Configure domain proxy hosts, target URL forwarding, SSL toggle, and export clean Nginx configurations.
- ⏰ **Visual Cron Job Manager**: Create, schedule, toggle, and execute custom background cron jobs with last run timestamp and execution logs.
- 📦 **Backup & Disaster Recovery**: Create `.tar.gz` system archives, list backups, download archive files, and perform system restorations.
- 🔔 **Multi-Channel Alert Engine**: Integrations for Telegram, Discord, Slack, and generic Webhooks with threshold rules (CPU > 80%, RAM > 90%, Disk > 90%).
- 📜 **Security Audit Trail**: Log recording username, IP address, action type, timestamp, and detailed activity logs.
- 🛡️ **Authentication & Role Security**: Bcrypt password hashing, JWT sessions, mandatory first-login password update, and optional TOTP 2FA.
- 🌍 **Multilingual Interface (i18n)**: Native UI support for English 🇬🇧, Turkish 🇹🇷, and German 🇩🇪.

---

## 📋 System Requirements

| Metric | Minimum Requirement | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 20.04+, Debian 11+, AlmaLinux 8+, Fedora 36+, Arch Linux, Windows 10+ (Dev) | Ubuntu 22.04 LTS / Debian 12 |
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 256 MB (Idle RAM < 30MB) | 1 GB+ |
| **Disk Space** | 50 MB (binary + DB) | 5 GB+ (for backups & Docker images) |
| **Go Version** | Go 1.22+ *(only if building from source)* | Go 1.22+ |
| **Node.js Version** | Node.js 18+ *(only if modifying frontend)* | Node.js 20 LTS |

---

## ⚙️ Environment Variables & Configuration

Configuration is managed via environment variables or a `.env` file in the root execution directory. Refer to `.env.example` for details:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | HTTP & WebSocket server port |
| `ENV` | `production` | Execution environment (`production` or `development`) |
| `DB_PATH` | `/opt/yare/yare.db` | SQLite database file storage location |
| `JWT_SECRET` | *(Auto-generated UUID)* | Secret key for signing JWT tokens (min 32 chars in production) |
| `ALLOW_ORIGIN` | `*` | CORS allowed origin header |

### Sample `.env` Configuration:
```env
PORT=8080
ENV=production
DB_PATH=/var/lib/yare/yare.db
JWT_SECRET=c8f7e3d1a9b24e5f60718293a4b5c6d7e8f90123456789abcdef0123456789ab
ALLOW_ORIGIN=*
```

---

## 🛡️ Production Security Checklist

For production server deployments, adhere to the following security guidelines:

1. **Change Default Credentials**: Update the `admin` password immediately upon initial login.
2. **Set a Custom `JWT_SECRET`**: Provide a strong 32+ character random string via `JWT_SECRET` environment variable.
3. **Configure HTTPS/TLS**: Place YARE behind a reverse proxy (Nginx, Caddy, or Cloudflare Tunnel) to enforce SSL/TLS encryption.
4. **Firewall Rules**: Limit incoming traffic on port `8080` to trusted IP addresses or rely on localhost proxying.
5. **Enable TOTP 2FA**: Enable 2-Factor Authentication in **Settings -> Account**.
6. **Restrict System Permissions**: Run YARE as a dedicated system user (e.g. `yare`) rather than root when possible.

---

## 📦 Backup & Recovery

YARE includes a native backup engine:

- **Create Backup**: Navigate to **Backup Manager** -> Click **Create Backup** -> Specify target directory path (e.g., `/etc` or `/opt/app`).
- **Download Backup**: Click **Download** on any backup entry to download the compressed `.tar.gz` archive to your local computer.
- **Storage Location**: Backups are saved in `/var/lib/yare/backups` or the configured storage path.

---

## ❓ Troubleshooting

### 1. Port 8080 is Already in Use
If port 8080 is occupied by another process, launch YARE with a custom port:
```bash
PORT=9090 ./yare-panel
```

### 2. Permission Denied on Database File
If YARE fails to initialize SQLite database:
```bash
sudo mkdir -p /opt/yare
sudo chown -R $USER:$USER /opt/yare
```

### 3. Docker Features Unavailable
If Docker containers do not appear or return permission errors, verify Docker daemon is running and add your user to the `docker` group:
```bash
sudo systemctl status docker
sudo usermod -aG docker $USER
```

### 4. Systemd Service Fails to Start
Inspect live systemd service logs:
```bash
journalctl -u yare.service -f --no-pager
```

### 5. WebSocket Terminal Fails to Connect
Ensure your reverse proxy (Nginx/Caddy) forwards `Upgrade` and `Connection` headers:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
```

---

## 💻 Developer Guide

### Monorepo Structure

```text
YARE-Control-Panel/
├── apps/
│   ├── backend/             # Go 1.22+ Gin API Engine & SQLite DB
│   │   ├── internal/        # API Controllers, Auth, System Collectors, DB
│   │   └── main.go          # Application Entry Point & SPA Embed
│   └── frontend/            # React 18, TypeScript, Vite, Tailwind CSS
│       └── src/             # Views, Components, Services, i18n Locales
├── packages/
│   ├── types/               # Shared TypeScript Types
│   └── utils/               # Shared Utilities
├── install/                 # Linux Installer & Systemd Service
├── scripts/                 # Build & Helper Scripts
├── docker-compose.yml       # Production Container Stack
├── Dockerfile               # Multi-stage Docker Build
├── Makefile                 # Development Commands
├── .env.example             # Environment Configuration Template
└── LICENSE                  # MIT License
```

### Useful Development Commands

```bash
# Run backend tests
cd apps/backend && go test ./...

# Build frontend
cd apps/frontend && npm run build

# Start dev mode on Windows
.\start.bat

# Build Windows standalone executable
.\build-win.bat
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
