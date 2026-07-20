# YARE Panel REST API Specification (v1)

Base URL: `/api/v1`

## 🔒 Authentication

- `POST /api/v1/auth/login`
  - **Payload**: `{ "username": "admin", "password": "..." }`
  - **Returns**: Access token (JWT), refresh token, user details.

- `POST /api/v1/auth/refresh`
  - **Payload**: `{ "refreshToken": "..." }`
  - **Returns**: New JWT access & refresh tokens.

- `GET /api/v1/auth/me` [Protected]
  - **Returns**: Current authenticated user profile.

---

## 📊 Telemetry & Realtime Streams

- `GET /api/v1/dashboard/stats` [Protected]
  - **Returns**: Current system metrics snapshot.

- `WS /api/v1/ws/metrics?token=<JWT>` [Public/WS]
  - Realtime 1-second interval WebSocket telemetry stream.

- `WS /api/v1/ws/terminal?token=<JWT>` [Public/WS]
  - Interactive multi-tab PTY terminal stream.

---

## 📁 File Manager API

- `GET /api/v1/files/list?path=/etc`
- `GET /api/v1/files/content?path=/etc/nginx.conf`
- `POST /api/v1/files/save`
- `POST /api/v1/files/create`
- `DELETE /api/v1/files/delete`
- `POST /api/v1/files/chmod`
- `POST /api/v1/files/upload`
- `POST /api/v1/files/zip`

---

## ⚙️ Services & Docker API

- `GET /api/v1/services`
- `POST /api/v1/services/:name/:action`
- `GET /api/v1/docker/containers`
- `GET /api/v1/docker/images`
- `GET /api/v1/docker/volumes`
- `GET /api/v1/docker/networks`
- `POST /api/v1/docker/containers/:id/:action`
