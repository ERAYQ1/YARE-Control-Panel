# YARE Control Panel (YARE OS) 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE OS** is a lightweight, ultra-fast, modern Linux server management control panel inspired by CasaOS and 1Panel. Built with a focus on zero bloat and high efficiency, YARE combines a high-performance **Go 1.22** backend with a modern **React 18** frontend. It compiles into a single, self-contained executable with embedded SPA assets (`embed.FS`), consuming under **30 MB RAM** at idle.

---

## ⚡ Quick Start (1-Command Installation)

Run this single command on any 64-bit Linux distribution (Ubuntu, Debian, AlmaLinux, Fedora, Arch) to install and start YARE OS in seconds:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

- **Dashboard Access**: `http://<server-ip>:8080` (or `http://localhost:8080`)
- **Default Credentials**: Username: `admin` | Password: `admin123`

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📊 **Server Telemetry & Monitoring** | Real-time monitoring of CPU, RAM, Disk, and Network bandwidth with live interactive charts and top process triage. |
| 📦 **App Store & 1-Click Apps** | Single-click installation and management for Nginx, Redis, PostgreSQL, MySQL, Node.js, Python, MongoDB, WordPress, phpMyAdmin, Gitea, Grafana, and more. |
| 📁 **File Manager** | Native browser filesystem explorer (`/`), file uploader/downloader, code editor with syntax highlighting, and archive (`.zip`/`.tar.gz`) manager. |
| 📟 **Interactive Web Terminal** | Secure, low-latency WebSocket terminal emulator based on `xterm.js` for direct server access right in your browser. |
| 🌐 **Reverse Proxy & Domains** | Easily manage Nginx/Caddy proxy rules, domain routing, custom headers, and automated Let's Encrypt SSL certificates. |
| ⏰ **Cron Job Scheduler** | Visual interface to schedule, enable, disable, and track execution logs of system cron jobs. |
| 💾 **Backup & Restore System** | Automated and manual snapshot backups for databases, application configs, and system files with local/remote storage options. |
| 🔔 **Alert Manager** | Configurable CPU, Memory, and Disk utilization thresholds with instant email and webhook notifications. |
| 🛡️ **Systemd Services Manager** | Control Linux system services (`systemd`) with live status indicators, start, stop, restart, enable, and disable controls. |
| 📜 **Real-time Log Viewer** | Stream and filter system logs (`journalctl`, syslog, app logs) with keyword search and live updates. |
| 👥 **User & Access Management** | Multi-user support with Role-Based Access Control (RBAC) and detailed audit logging for security compliance. |
| ⚙️ **Settings & Customization** | Light/Dark mode themes, multi-language support (English, Turkish, German), 2FA authentication, and API key management. |

---

## 🚀 Manual Binary Installation

Download and execute the compiled binary directly on your Linux host:

```bash
wget https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-panel-linux-amd64
chmod +x yare-panel-linux-amd64
./yare-panel-linux-amd64
```

---

## 🛠️ Building From Source

### Prerequisites
- **Go**: `1.22+`
- **Node.js**: `18.0+`
- **npm** or **pnpm**

### Step-by-Step Build

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
   cd YARE-Control-Panel
   ```

2. **Install Dependencies**
   ```bash
   npm run setup
   ```

3. **Development Mode** (Run Frontend & Backend concurrently)
   ```bash
   npm run dev
   ```

4. **Production Build** (Creates a single unified `yare-panel` executable)
   ```bash
   npm run build
   ```

---

## 🏗️ Project Architecture

```
YARE-Control-Panel/
├── apps/
│   ├── backend/               # Go 1.22 High-Performance REST & WebSocket API
│   │   ├── cmd/               # Entrypoint & CLI setup
│   │   ├── internal/          # System collectors, API v1 routes, auth, db, services
│   │   └── dist/              # Embedded frontend assets (embed.FS)
│   └── frontend/              # React 18 + TypeScript + Vite + Tailwind CSS SPA
│       ├── src/
│       │   ├── components/    # Reusable UI components & layouts
│       │   ├── views/         # Page views (Dashboard, AppStore, Terminal, etc.)
│       │   ├── services/      # API & WebSocket client services
│       │   └── i18n/          # Internationalization (TR, EN, DE)
├── docs/                      # Technical documentation & API references
├── install/                   # Automated deployment & installation scripts
├── package.json               # Monorepo scripts & orchestration
├── Makefile                   # Build automation Makefile
└── README.md                  # Project documentation
```

---

## ⚙️ Environment Configuration

You can customize runtime behavior by creating a `.env` file in the root directory:

```env
PORT=8080
ENV=production
DB_PATH=/opt/yare/yare.db
JWT_SECRET=your-random-32-character-secret-key
ALLOW_ORIGIN=*
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
