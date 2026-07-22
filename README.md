# YARE Control Panel (YARE OS) 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE OS** is a lightweight, ultra-fast, modern Linux server management control panel inspired by CasaOS and 1Panel. Built with zero bloat and high performance in mind, YARE combines a high-performance **Go 1.22** backend with a modern **React 18** frontend. It compiles into a single, self-contained executable binary embedding frontend static assets (`embed.FS`), consuming under **30 MB RAM** at idle.

---

## ⚡ Quick Start (1-Command Automated Installation)

Run this single command on any 64-bit Linux distribution (Ubuntu, Debian, AlmaLinux, Fedora, Arch) to automatically install, configure, and start YARE OS as a system daemon in seconds:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

- **Dashboard Access**: `http://<server-ip>:8080` (or `http://localhost:8080`)
- **Default Credentials**: Username: `admin` | Password: `admin123` *(Mandatory password update required on first login)*

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📊 **Server Telemetry & Monitoring** | Real-time WebSocket streaming of CPU, RAM, Disk, and Network bandwidth with live interactive charts and top process triage. |
| 📦 **App Store & 1-Click Apps** | Single-click installation and container management for Portainer, Uptime Kuma, Nginx Proxy Manager, PostgreSQL, Redis, MinIO, Grafana, n8n, Nextcloud, Meilisearch, and custom GitHub repos. |
| 📁 **File Manager & Code Editor** | Native browser filesystem explorer (`/` and container `/hostroot`), code editor, file uploader/downloader, `chmod` permissions manager, and `.zip` archive compressor. Sandboxed against path traversal. |
| 📟 **Interactive Web Terminal** | Secure, low-latency WebSocket terminal emulator based on `xterm.js` connected to host `/bin/bash` or `powershell.exe` with JWT query string authentication. |
| 🌐 **Reverse Proxy & Domains** | Easily manage domain routing rules, export production Nginx server blocks, and set up Let's Encrypt SSL configurations. |
| ⏰ **Cron Job Scheduler** | Automated background ticker engine (`cronworker`) that schedules, enables, disables, tracks, and automatically executes system cron jobs. |
| 💾 **Backup & Disaster Recovery** | Automated and manual snapshot backups for databases, application configs, and system files with local storage tracking. |
| 🔔 **Alerting & Notification Engine** | Background metric monitor worker (`alertworker`) that continuously evaluates CPU, RAM, and Disk utilization thresholds and dispatches Webhook alerts. |
| 🛡️ **Systemd Services Manager** | Control Linux system services (`systemctl`) with live status indicators, start, stop, restart, enable, disable controls, and `journalctl` log viewer. |
| 📜 **Real-time Log Viewer** | Stream and filter system logs (`journalctl`, syslog, app logs) with keyword search and live updates. |
| 👥 **User & Access Management** | Multi-user support with Role-Based Access Control (RBAC: Admin, Operator, Viewer), SSH key manager, and detailed audit logging. |
| 🔒 **Security & 2FA (TOTP)** | Zero-dependency RFC 6238 TOTP two-factor authentication (Google Authenticator / Authy), mandatory default password change enforcement, and path-traversal sandboxing. |
| ⚙️ **Settings & Customization** | Theme-aware Dark and Light mode, multi-language support (English, Turkish, German), session timeout controls, and API rate limiting. |

---

## 🏗️ Project Architecture

```
YARE-Control-Panel/
├── apps/
│   ├── backend/               # Go 1.22 High-Performance REST & WebSocket API Engine
│   │   ├── cmd/               # CLI setup & entrypoint
│   │   ├── internal/
│   │   │   ├── alertworker/   # Background metric alert monitoring worker
│   │   │   ├── api/v1/        # REST & WebSocket API v1 controllers
│   │   │   ├── auth/          # JWT token generation & RFC 6238 TOTP engine
│   │   │   ├── config/        # Environment configuration loader
│   │   │   ├── cronworker/    # Background automated cron job scheduler worker
│   │   │   ├── database/      # SQLite WAL database & index migrations
│   │   │   ├── middleware/    # Security headers, CORS, Rate limiting & JWT Auth
│   │   │   └── system/        # System telemetry collectors (gopsutil)
│   │   └── main.go            # Entrypoint with embedded frontend (embed.FS)
│   └── frontend/              # React 18 + TypeScript + Vite + Tailwind CSS SPA
│       ├── src/
│       │   ├── components/    # UI layout primitives, modals, tables, toasts
│       │   ├── views/         # 16 Feature views (Dashboard, AppStore, Terminal, etc.)
│       │   ├── services/      # Axios API & WebSocket client services
│       │   └── locales/       # Internationalization dictionary (TR, EN, DE)
│       └── tailwind.config.js # Theme CSS variables & token mappings
├── docs/                      # Technical documentation & API references
├── install/                   # Automated deployment & installation scripts (`install.sh`)
├── packages/
│   ├── types/                 # Shared TypeScript interface definitions
│   └── utils/                 # Shared formatting & helper utilities
├── package.json               # Monorepo scripts & orchestration
├── Makefile                   # Build automation Makefile
└── README.md                  # Comprehensive project documentation
```

---

## ⚙️ Environment Configuration

You can customize runtime behavior by creating a `.env` file in the root directory or passing environment variables:

```env
# Server Listening Port (Default: 8080, Fallback: 8081)
PORT=8080

# Environment Mode ('production' or 'development')
ENV=production

# SQLite Database Storage Location
DB_PATH=/opt/yare/yare.db

# JWT Secret Key (High-entropy secret key, min 32 chars)
JWT_SECRET=replace-with-a-secure-random-32-character-secret-key

# CORS Allowed Origin (* or specific domain)
ALLOW_ORIGIN=*
```

---

## 🚀 Manual Binary Installation & Systemd Service

Download and execute the compiled binary directly on your Linux host:

```bash
# 1. Download binary executable
wget https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-panel-linux-amd64 -O yare-panel
chmod +x yare-panel

# 2. Run manually
./yare-panel
```

### Setup Systemd Service Daemon

To run YARE Panel automatically on server boot:

```bash
sudo tee /etc/systemd/system/yare-panel.service > /dev/null <<'EOF'
[Unit]
Description=YARE Control Panel Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/yare
ExecStart=/opt/yare/yare-panel
Restart=always
RestartSec=5
Environment=PORT=8080
Environment=ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now yare-panel
```

---

## 🛠️ Building From Source

### Prerequisites
- **Go**: `1.22+`
- **Node.js**: `18.0+`
- **npm** or **pnpm**

### Step-by-Step Build Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
   cd YARE-Control-Panel
   ```

2. **Install Workspace Dependencies**
   ```bash
   npm run setup
   ```

3. **Development Mode** (Run Frontend & Backend concurrently with hot reload)
   ```bash
   npm run dev
   ```

4. **Compile Production Single Executable Binary** (Bundles React frontend inside Go `embed.FS`)
   ```bash
   npm run build
   ```
   *The compiled single binary executable `yare-panel` will be placed in the project root.*

---

## 🧪 Testing & Verification

Run the automated test suite and type check commands:

```bash
# Run Go Backend Unit & Integration Tests
cd apps/backend && go test ./...

# Run Frontend Type Check & Vite Production Build
npm run build:frontend
```

---

## 📋 System Requirements

- **Operating System**: Linux (Ubuntu 20.04+, Debian 11+, AlmaLinux 8+, Fedora 36+, Arch Linux)
- **CPU**: 1 vCPU (minimum)
- **RAM**: ~30 MB idle memory footprint
- **Storage**: ~50 MB disk space

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ERAYQ1/YARE-Control-Panel/issues).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
