# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/ERAYQ1/YARE-Control-Panel/actions)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel** is a modern, high-performance, open-source Linux server management platform built with Go and React. Designed with an obsidian dark aesthetic inspired by Vercel and Supabase, YARE compiles into a single self-contained binary embedding frontend static assets (`embed.FS`). It operates with an ultra-lightweight SQLite WAL database engine consuming less than 30MB RAM at idle without external runtime dependencies.

---

### ⚡ 1-Command Automated Script Installation

Run this single command on any 64-bit Linux server (Ubuntu, Debian, AlmaLinux, Fedora, Arch) to download, register systemd service, and launch YARE Control Panel instantly:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

---

### 🚀 2. Binary Download (GitHub Releases)

Download and run the pre-compiled standalone binary manually:

```bash
wget https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-panel-linux-amd64
chmod +x yare-panel-linux-amd64
./yare-panel-linux-amd64
```

- **Dashboard Access**: `http://localhost:8080` (or `http://<server-ip>:8080`)

---

### 🛠️ 2. Build From Source

To build the standalone single executable from source:

```bash
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel
cd apps/backend
go build -o yare-panel main.go
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
- ⚙️ **System Services Manager**: Inspect, start, stop, and restart systemd service daemons (`apache2`, `mysql`, `ssh`, `redis`, etc.) directly from the web interface.
- 📁 **Visual File Manager**: Browse server filesystem (`/`), view and edit files in code editor, upload files, delete items, create directories, and compress directories to `.zip`.
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
| **Operating System** | Linux (Ubuntu 20.04+, Debian 11+, AlmaLinux 8+, Fedora 36+, Arch Linux) | Ubuntu 22.04 LTS / Debian 12 |
| **CPU** | 1 vCPU | 1 vCPU |
| **RAM** | 30 MB (Idle RAM) | 512 MB+ |
| **Disk Space** | 50 MB | 5 GB+ (for system backups) |
| **Go Version** | Go 1.22+ *(only if building from source)* | Go 1.22+ |

---

## ⚙️ Environment Variables & Configuration

Configuration is managed via environment variables or a `.env` file in the execution directory. Refer to `.env.example` for details:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | HTTP & WebSocket server port |
| `ENV` | `production` | Execution environment (`production` or `development`) |
| `DB_PATH` | `yare.db` | SQLite database file storage location |
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

---

## 📦 Systemd Auto-Start Service Configuration

To run YARE as a systemd service:

```bash
sudo tee /etc/systemd/system/yare.service <<EOF
[Unit]
Description=YARE Control Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/yare
ExecStart=/opt/yare/yare-panel
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now yare.service
```

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

### 3. Systemd Service Fails to Start
Inspect live systemd service logs:
```bash
journalctl -u yare.service -f --no-pager
```

### 4. WebSocket Terminal Fails to Connect
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
├── install/                 # Systemd Service & Linux Installer
├── scripts/                 # Build & Helper Scripts
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

# Compile Linux standalone binary
make build
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
