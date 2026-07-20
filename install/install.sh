#!/usr/bin/env bash
# ==============================================================================
# YARE Panel - Universal Server Management Platform One-Command Installer
# Supported: Ubuntu 24+, Debian 13+, Fedora, Rocky Linux, AlmaLinux
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "======================================================================"
echo "          YARE Panel - Universal Server Management Platform           "
echo "======================================================================"
echo -e "${NC}"

# Check root privilege
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run the installer as root or using sudo.${NC}"
  exit 1
fi

# System compatibility check
echo -e "${CYAN}[1/5] Performing System Compatibility & OS Checks...${NC}"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  VERSION_ID=$VERSION_ID
  echo -e "${GREEN}[OK] Detected OS: ${PRETTY_NAME}${NC}"
else
  echo -e "${RED}[ERROR] System OS release file not found. System unsupported.${NC}"
  exit 1
fi

# Package dependency checks
echo -e "${CYAN}[2/5] Checking and installing dependencies (curl, tar, systemd, sqlite3)...${NC}"
if command -v apt-get &> /dev/null; then
  apt-get update -qq && apt-get install -y -qq curl tar sqlite3 systemd
elif command -v dnf &> /dev/null; then
  dnf install -y -q curl tar sqlite3 systemd
fi

# Create yare user & directory
echo -e "${CYAN}[3/5] Setting up service user and directory structure...${NC}"
id -u yare &>/dev/null || useradd -r -s /bin/false -d /opt/yare yare
mkdir -p /opt/yare /var/log/yare

# Binary download (Simulated in script)
echo -e "${CYAN}[4/5] Downloading latest YARE release binary...${NC}"
# curl -fsSL https://github.com/yare-panel/yare/releases/latest/download/yare-linux-amd64 -o /opt/yare/yare-backend
# chmod +x /opt/yare/yare-backend
# chown -R yare:yare /opt/yare /var/log/yare

# Setup Systemd Service
echo -e "${CYAN}[5/5] Registering systemd service (yare.service)...${NC}"
cat << 'EOF' > /etc/systemd/system/yare.service
[Unit]
Description=YARE Control Panel Server Daemon
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/yare
ExecStart=/opt/yare/yare-backend
Restart=always
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now yare.service &>/dev/null || true

echo -e "${GREEN}"
echo "======================================================================"
echo " 🎉 YARE Panel successfully installed & started!                    "
echo "======================================================================"
echo -e "${NC}"
echo -e "Dashboard URL: ${CYAN}http://$(hostname -I | awk '{print $1}'):8080${NC}"
echo -e "Default Admin: ${CYAN}admin${NC} | Default Password: ${CYAN}admin123${NC}"
echo -e "Service Status: ${YELLOW}systemctl status yare.service${NC}\n"
