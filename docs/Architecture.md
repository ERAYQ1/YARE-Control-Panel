# YARE Panel Architecture & Technical Design

## 🏗 System Architecture Overview

YARE Panel is designed as a decoupled, high-performance monorepo architecture:

```
                  +-----------------------------------+
                  |   Browser Client (React 19 SPA)   |
                  +-----------------------------------+
                                    |
                    HTTP REST & WebSocket Connections
                                    v
                  +-----------------------------------+
                  |     Go (Gin) API Gateway Daemon   |
                  +-----------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
         v                          v                          v
  +--------------+          +----------------+          +--------------+
  | SQLite DB    |          | Linux OS Core  |          | Docker Engine|
  | (embedded)   |          | systemd, PTY   |          | SDK / Socket |
  +--------------+          +----------------+          +--------------+
```

## Key Principles

1. **Lightweight & Fast**: Uses Go compiled binary and Vite optimized bundle. Memory idle footprint is under 30MB.
2. **System Abstraction Layer**: Automatically uses native Linux `systemctl`, `journalctl`, and OS syscalls when deployed on Linux, while providing realistic emulation during local cross-platform development.
3. **Modular Plugin Architecture**: Lifecycle handlers (`Install`, `Enable`, `Disable`, `Remove`) allowing runtime loading of custom management modules.
4. **Role-Based Access Control**: Strict JWT token authorization enforcing Admin, Operator, and ReadOnly privilege tiers.
