#!/usr/bin/env bash
# ==============================================================================
# YARE Panel - Universal Server Management Platform One-Command Installer
# Supported OS: Ubuntu 22+, Debian 12+, Fedora, Rocky Linux, AlmaLinux, Arch
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "======================================================================"
echo "          YARE Panel - Universal Server Management Platform           "
echo "======================================================================"
echo -e "${NC}"

# Check root privilege
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run the installer as root or using sudo.${NC}"
  exit 1
fi

# Detect Architecture
ARCH=$(uname -m)
case $ARCH in
  x86_64)  BINARY_ARCH="amd64" ;;
  aarch64) BINARY_ARCH="arm64" ;;
  armv7l)  BINARY_ARCH="arm" ;;
  *)       echo -e "${RED}[ERROR] Unsupported architecture: ${ARCH}${NC}"; exit 1 ;;
esac

echo -e "${CYAN}[1/6] Performing System & OS Compatibility Checks...${NC}"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  echo -e "${GREEN}[OK] Detected System: ${PRETTY_NAME:-Linux} (${ARCH})${NC}"
else
  echo -e "${YELLOW}[WARN] Operating system information file not found, proceeding...${NC}"
fi

# Install Dependencies
echo -e "${CYAN}[2/6] Verifying and installing system dependencies (curl, tar, sqlite3, systemd)...${NC}"
if command -v apt-get &> /dev/null; then
  apt-get update -qq && apt-get install -y -qq curl tar sqlite3 systemd ufw
elif command -v dnf &> /dev/null; then
  dnf install -y -q curl tar sqlite3 systemd firewalld
elif command -v pacman &> /dev/null; then
  pacman -Sy --noconfirm curl tar sqlite systemd
fi

# Setup Directory & Service User
echo -e "${CYAN}[3/6] Configuring service paths and binary setup...${NC}"
mkdir -p /opt/yare /var/log/yare /etc/yare
id -u yare &>/dev/null || useradd -r -s /bin/false -d /opt/yare yare

# Copy local binary if running from source repo
if [ -f "./apps/backend/bin/yare-backend" ]; then
  cp "./apps/backend/bin/yare-backend" /opt/yare/yare-backend
  chmod +x /opt/yare/yare-backend
elif [ -f "./yare-backend" ]; then
  cp "./yare-backend" /opt/yare/yare-backend
  chmod +x /opt/yare/yare-backend
elif [ ! -f "/opt/yare/yare-backend" ]; then
  echo -e "${YELLOW}[INFO] Fetching latest YARE Panel binary for ${BINARY_ARCH}...${NC}"
  LATEST_URL="https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-backend-linux-${BINARY_ARCH}"
  curl -fsSL "$LATEST_URL" -o /opt/yare/yare-backend || {
    echo -e "${YELLOW}[WARN] Release binary not found online. Please build binary locally using 'npm run build' first.${NC}"
  }
  chmod +x /opt/yare/yare-backend 2>/dev/null || true
fi

# Generate Secure JWT Secret if missing
JWT_SECRET_FILE="/etc/yare/jwt.secret"
if [ ! -f "$JWT_SECRET_FILE" ]; then
  cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1 > "$JWT_SECRET_FILE" || echo "yare_default_secret_key_change_in_production_32bytes" > "$JWT_SECRET_FILE"
  chmod 600 "$JWT_SECRET_FILE"
fi
JWT_SECRET=$(cat "$JWT_SECRET_FILE")

# Setup Systemd Service
echo -e "${CYAN}[4/6] Registering systemd daemon service (yare.service)...${NC}"
cat << EOF > /etc/systemd/system/yare.service
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
RestartSec=3s
LimitNOFILE=65536
Environment="PORT=8080"
Environment="ENV=production"
Environment="DB_PATH=/opt/yare/yare.db"
Environment="JWT_SECRET=${JWT_SECRET}"

[Install]
WantedBy=multi-user.target
EOF

# Configure Firewall
echo -e "${CYAN}[5/6] Opening port 8080 in system firewall...${NC}"
if command -v ufw &> /dev/null; then
  ufw allow 8080/tcp &>/dev/null || true
elif command -v firewall-cmd &> /dev/null; then
  firewall-cmd --add-port=8080/tcp --permanent &>/dev/null || true
  firewall-cmd --reload &>/dev/null || true
fi

# Start Service
echo -e "${CYAN}[6/6] Launching YARE Panel engine...${NC}"
systemctl daemon-reload
systemctl enable --now yare.service &>/dev/null || true

# Get Server Primary IP
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "${GREEN}${BOLD}"
echo "======================================================================"
echo " 🎉 YARE Panel successfully installed & verified!                    "
echo "======================================================================"
echo -e "${NC}"
echo -e "Dashboard URL : ${CYAN}${BOLD}http://${SERVER_IP}:8080${NC}"
echo -e "Default User  : ${CYAN}${BOLD}admin${NC}"
echo -e "Default Pass  : ${CYAN}${BOLD}admin123${NC}"
echo -e "Status Command: ${YELLOW}systemctl status yare.service${NC}"
echo -e "Service Log   : ${YELLOW}journalctl -u yare.service -f${NC}\n"
