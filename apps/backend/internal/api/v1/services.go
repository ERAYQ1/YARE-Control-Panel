package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ServicesController struct{}

func NewServicesController() *ServicesController {
	return &ServicesController{}
}

type ServiceItem struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	LoadState   string `json:"loadState"`
	ActiveState string `json:"activeState"`
	SubState    string `json:"subState"`
	IsEnabled   bool   `json:"isEnabled"`
	PID         int    `json:"pid,omitempty"`
	MemoryUsage uint64 `json:"memoryUsage,omitempty"`
}

func (sc *ServicesController) ListServices(c *gin.Context) {
	// Sample systemd services list
	services := []ServiceItem{
		{Name: "docker.service", Description: "Docker Application Container Engine", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 1042, MemoryUsage: 280 * 1024 * 1024},
		{Name: "nginx.service", Description: "A high performance web server and a reverse proxy server", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 844, MemoryUsage: 18 * 1024 * 1024},
		{Name: "yare.service", Description: "YARE Server Management Platform Service", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 1894, MemoryUsage: 45 * 1024 * 1024},
		{Name: "postgresql.service", Description: "PostgreSQL RDBMS Engine", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 3120, MemoryUsage: 340 * 1024 * 1024},
		{Name: "redis-server.service", Description: "Advanced key-value store", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 4051, MemoryUsage: 78 * 1024 * 1024},
		{Name: "ssh.service", Description: "OpenBSD Secure Shell server", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 712, MemoryUsage: 12 * 1024 * 1024},
		{Name: "ufw.service", Description: "Uncomplicated firewall", LoadState: "loaded", ActiveState: "active", SubState: "exited", IsEnabled: true, PID: 0, MemoryUsage: 0},
		{Name: "cron.service", Description: "Regular background program processing daemon", LoadState: "loaded", ActiveState: "active", SubState: "running", IsEnabled: true, PID: 580, MemoryUsage: 8 * 1024 * 1024},
		{Name: "apache2.service", Description: "The Apache HTTP Server", LoadState: "loaded", ActiveState: "inactive", SubState: "dead", IsEnabled: false, PID: 0, MemoryUsage: 0},
		{Name: "certbot.timer", Description: "Run certbot twice daily", LoadState: "loaded", ActiveState: "active", SubState: "waiting", IsEnabled: true, PID: 0, MemoryUsage: 0},
	}

	c.JSON(http.StatusOK, services)
}

func (sc *ServicesController) ServiceAction(c *gin.Context) {
	name := c.Param("name")
	action := c.Param("action") // start, stop, restart, enable, disable

	c.JSON(http.StatusOK, gin.H{
		"message": "Service action executed successfully",
		"service": name,
		"action":  action,
	})
}
