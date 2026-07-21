# YARE Control Panel (YARE OS) 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE OS** is an ultra-simple, blazingly fast, CasaOS-inspired Linux server management system. Designed for extreme simplicity and zero bloat, YARE compiles into a single self-contained executable embedding the frontend SPA (`embed.FS`). It consumes less than **30 MB RAM** at idle without external runtime dependencies.

---

## ⚡ Quick Start (1-Command Installation)

Run this single command on any 64-bit Linux server (Ubuntu, Debian, AlmaLinux, Fedora, Arch) to install and launch YARE OS in under 5 seconds:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

- **Dashboard Access**: `http://localhost:8080` (or `http://<server-ip>:8080`)
- **Default Login**: Username: `admin` | Password: `admin123`

---

## 🚀 Manual Binary Download

```bash
wget https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-panel-linux-amd64
chmod +x yare-panel-linux-amd64
./yare-panel-linux-amd64
```

---

## 🛠️ Build From Source

```bash
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel
npm run build
./yare-panel
```

---

## ✨ Core Features (Zero-Bloat Architecture)

1. 📊 **Dashboard / Server Telemetry**: Real-time CPU, Memory, Disk, Network bandwidth gauges, and top process triage.
2. 📦 **App Store / 1-Click App Installer**: 1-Click install & manage applications (Nginx, Redis, PostgreSQL, MySQL, Node.js, Python, MongoDB, WordPress, etc.).
3. 📁 **File Manager**: Visual server filesystem browser (`/`), file uploader, code editor, and `.zip` archive manager.
4. 📟 **Web Terminal**: Interactive WebSocket terminal shell (`xterm.js`).
5. ⚙️ **Settings**: Account security, password updates, 2FA, and Light/Dark mode themes.

---

## 📋 System Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 11+, AlmaLinux 8+, Fedora 36+, Arch Linux)
- **CPU**: 1 vCPU
- **RAM**: 30 MB (Idle)
- **Disk**: 50 MB

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
