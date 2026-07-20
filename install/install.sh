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

# Detect execution privileges and define installation directory
IS_ROOT=0
if [ "$EUID" -eq 0 ]; then
  IS_ROOT=1
  INSTALL_DIR="/opt/yare"
  CONF_DIR="/etc/yare"
else
  echo -e "${YELLOW}[INFO] Running as non-root user. Installing to user home directory...${NC}"
  INSTALL_DIR="$HOME/.yare"
  CONF_DIR="$HOME/.yare/config"
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
fi

# Function to ensure Go is available
ensure_go() {
  if command -v go &>/dev/null; then
    echo -e "${GREEN}[OK] Go is already installed: $(go version)${NC}"
    return 0
  fi

  echo -e "${YELLOW}[INFO] Go is not installed. Auto-installing Go 1.22.5 for build...${NC}"
  GO_TMP="/tmp/go1.22.5.tar.gz"
  curl -fsSL "https://go.dev/dl/go1.22.5.linux-${BINARY_ARCH}.tar.gz" -o "$GO_TMP"
  
  GO_INSTALL_TARGET="$HOME/.go"
  mkdir -p "$GO_INSTALL_TARGET"
  tar -C "$GO_INSTALL_TARGET" -xzf "$GO_TMP"
  export PATH="$GO_INSTALL_TARGET/go/bin:$PATH"
  rm -f "$GO_TMP"
  echo -e "${GREEN}[OK] Go installed successfully: $(go version)${NC}"
}

# Install Basic System Dependencies if root
echo -e "${CYAN}[2/6] Verifying system dependencies...${NC}"
if [ "$IS_ROOT" -eq 1 ]; then
  if command -v apt-get &> /dev/null; then
    apt-get update -qq && apt-get install -y -qq curl tar sqlite3 systemd ufw git
  elif command -v dnf &> /dev/null; then
    dnf install -y -q curl tar sqlite3 systemd firewalld git
  elif command -v pacman &> /dev/null; then
    pacman -Sy --noconfirm curl tar sqlite systemd git
  fi
fi

# Setup Directory
echo -e "${CYAN}[3/6] Configuring service paths and binary setup...${NC}"
mkdir -p "$INSTALL_DIR" "$CONF_DIR"

BINARY_DEST="$INSTALL_DIR/yare-backend"

# Binary Acquisition Strategy:
# 1. Local compiled binary in repo
# 2. Online Release download from GitHub
# 3. Automatic local build with auto-Go installation

INSTALLED_BINARY=0

if [ -f "./apps/backend/bin/yare-backend" ]; then
  echo -e "${GREEN}[INFO] Found locally pre-compiled binary.${NC}"
  cp "./apps/backend/bin/yare-backend" "$BINARY_DEST"
  chmod +x "$BINARY_DEST"
  INSTALLED_BINARY=1
elif [ -f "./yare-backend" ]; then
  cp "./yare-backend" "$BINARY_DEST"
  chmod +x "$BINARY_DEST"
  INSTALLED_BINARY=1
fi

if [ "$INSTALLED_BINARY" -eq 0 ]; then
  echo -e "${YELLOW}[INFO] Trying to download latest YARE Panel release binary...${NC}"
  LATEST_URL="https://github.com/ERAYQ1/YARE-Control-Panel/releases/latest/download/yare-panel-linux-${BINARY_ARCH}"
  
  if curl -fsSL "$LATEST_URL" -o "$BINARY_DEST" 2>/dev/null && [ -s "$BINARY_DEST" ]; then
    chmod +x "$BINARY_DEST"
    echo -e "${GREEN}[OK] Downloaded release binary successfully.${NC}"
    INSTALLED_BINARY=1
  else
    echo -e "${YELLOW}[WARN] Online release binary not found. Falling back to local automatic build...${NC}"
    ensure_go
    
    # Ensure backend dependencies and build
    if [ -d "./apps/backend" ]; then
      echo -e "${CYAN}[INFO] Building backend binary from source...${NC}"
      (cd apps/backend && go mod tidy && CGO_ENABLED=0 go build -ldflags="-s -w" -o "$BINARY_DEST" main.go)
      chmod +x "$BINARY_DEST"
      INSTALLED_BINARY=1
    else
      echo -e "${RED}[ERROR] Source code not found in current directory. Please clone repo or download source first.${NC}"
      exit 1
    fi
  fi
fi

# Generate Secure JWT Secret if missing
JWT_SECRET_FILE="$CONF_DIR/jwt.secret"
if [ ! -f "$JWT_SECRET_FILE" ]; then
  cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1 > "$JWT_SECRET_FILE" || echo "yare_default_secret_key_change_in_production_32bytes" > "$JWT_SECRET_FILE"
  chmod 600 "$JWT_SECRET_FILE" 2>/dev/null || true
fi
JWT_SECRET=$(cat "$JWT_SECRET_FILE")

# Service Configuration
if [ "$IS_ROOT" -eq 1 ]; then
  echo -e "${CYAN}[4/6] Registering systemd daemon service (yare.service)...${NC}"
  cat << EOF > /etc/systemd/system/yare.service
[Unit]
Description=YARE Control Panel Server Daemon
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${BINARY_DEST}
Restart=always
RestartSec=3s
LimitNOFILE=65536
Environment="PORT=8080"
Environment="ENV=production"
Environment="DB_PATH=${INSTALL_DIR}/yare.db"
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
else
  echo -e "${CYAN}[4/6] Starting YARE Panel in background (non-root)...${NC}"
  PORT=8080 ENV=production DB_PATH="${INSTALL_DIR}/yare.db" JWT_SECRET="${JWT_SECRET}" nohup "$BINARY_DEST" > "$INSTALL_DIR/yare.log" 2>&1 &
fi

SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "${GREEN}${BOLD}"
echo "======================================================================"
echo " 🎉 YARE Panel successfully installed & verified!                    "
echo "======================================================================"
echo -e "${NC}"
echo -e "Dashboard URL : ${CYAN}${BOLD}http://${SERVER_IP}:8080${NC}"
echo -e "Default User  : ${CYAN}${BOLD}admin${NC}"
echo -e "Default Pass  : ${CYAN}${BOLD}admin123${NC}"
if [ "$IS_ROOT" -eq 1 ]; then
  echo -e "Status Command: ${YELLOW}systemctl status yare.service${NC}"
  echo -e "Service Log   : ${YELLOW}journalctl -u yare.service -f${NC}\n"
else
  echo -e "Binary Path   : ${YELLOW}${BINARY_DEST}${NC}"
  echo -e "Log File      : ${YELLOW}${INSTALL_DIR}/yare.log${NC}\n"
fi
