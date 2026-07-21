package v1

import (
	"net/http"
	"os/exec"
	"runtime"
	"strings"

	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
)

type LogsController struct{}

func NewLogsController() *LogsController {
	return &LogsController{}
}

func (lc *LogsController) GetLogs(c *gin.Context) {
	source := c.DefaultQuery("source", "system")

	var logs []gin.H

	// 1. Fetch real audit logs from SQLite database
	rows, err := database.DB.Query(`SELECT id, created_at, action, username, ip_address, details FROM audit_logs ORDER BY created_at DESC LIMIT 50`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var id, createdAt, action, username, ip, details string
			if err := rows.Scan(&id, &createdAt, &action, &username, &ip, &details); err == nil {
				logs = append(logs, gin.H{
					"id":          id,
					"timestamp":   createdAt,
					"source":      source,
					"level":       "info",
					"message":     action + ": " + details + " (User: " + username + ", IP: " + ip + ")",
					"serviceName": "audit-log",
				})
			}
		}
	}

	// 2. Fetch real journalctl system logs on Linux if available
	if runtime.GOOS == "linux" && len(logs) < 10 {
		cmd := exec.Command("journalctl", "-n", "30", "--no-pager", "-o", "short-iso")
		out, err := cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(out)), "\n")
			for i, line := range lines {
				if strings.TrimSpace(line) == "" {
					continue
				}
				logs = append(logs, gin.H{
					"id":          "jlog-" + strings.TrimSpace(line[:10]) + "-" + string(rune(i)),
					"timestamp":   line[:19],
					"source":      "system",
					"level":       "info",
					"message":     line,
					"serviceName": "journald",
				})
			}
		}
	}

	c.JSON(http.StatusOK, logs)
}
