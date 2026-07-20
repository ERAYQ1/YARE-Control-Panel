package v1

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type LogsController struct{}

func NewLogsController() *LogsController {
	return &LogsController{}
}

func (lc *LogsController) GetLogs(c *gin.Context) {
	source := c.DefaultQuery("source", "system") // system, kernel, auth, docker, service

	now := time.Now()

	logs := []gin.H{
		{"id": "log-1", "timestamp": now.Add(-10 * time.Minute).Format("2006-01-02 15:04:05"), "source": source, "level": "info", "message": "YARE daemon service initialized successfully", "serviceName": "yare.service"},
		{"id": "log-2", "timestamp": now.Add(-8 * time.Minute).Format("2006-01-02 15:04:05"), "source": source, "level": "info", "message": "User 'admin' logged in successfully from IP 192.168.1.50", "serviceName": "auth"},
		{"id": "log-3", "timestamp": now.Add(-5 * time.Minute).Format("2006-01-02 15:04:05"), "source": source, "level": "warn", "message": "High memory consumption detected on container 'production-postgres' (88%)", "serviceName": "dockerd"},
		{"id": "log-4", "timestamp": now.Add(-3 * time.Minute).Format("2006-01-02 15:04:05"), "source": source, "level": "info", "message": "Systemd reloaded service unit file nginx.service", "serviceName": "systemd"},
		{"id": "log-5", "timestamp": now.Add(-1 * time.Minute).Format("2006-01-02 15:04:05"), "source": source, "level": "info", "message": "Periodic SQLite database backup completed without errors", "serviceName": "yare-db"},
		{"id": "log-6", "timestamp": now.Format("2006-01-02 15:04:05"), "source": source, "level": "info", "message": "WebSocket client connected to /api/v1/ws/metrics", "serviceName": "ws-engine"},
	}

	c.JSON(http.StatusOK, logs)
}
