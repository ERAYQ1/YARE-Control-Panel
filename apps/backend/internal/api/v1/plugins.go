package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type PluginsController struct{}

func NewPluginsController() *PluginsController {
	return &PluginsController{}
}

func (pc *PluginsController) ListPlugins(c *gin.Context) {
	plugins := []gin.H{
		{
			"id":          "plugin-fail2ban",
			"name":        "Fail2ban Security Shield",
			"version":     "1.2.0",
			"description": "Monitors authentication logs and automatically blocks malicious brute-force IP addresses.",
			"author":      "YARE Core Team",
			"isEnabled":   true,
			"icon":        "ShieldCheck",
		},
		{
			"id":          "plugin-nginx-vhost",
			"name":        "Nginx VirtualHost Manager",
			"version":     "2.0.1",
			"description": "Manage Nginx reverse proxy domains, SSL Let's Encrypt certificates, and location rules.",
			"author":      "YARE Community",
			"isEnabled":   true,
			"icon":        "Globe",
		},
		{
			"id":          "plugin-backup-s3",
			"name":        "S3 Automated Backups",
			"version":     "1.0.5",
			"description": "Scheduled database and directory backups directly to AWS S3, Cloudflare R2, or MinIO.",
			"author":      "YARE Core Team",
			"isEnabled":   false,
			"icon":        "CloudUpload",
		},
		{
			"id":          "plugin-cron-visualizer",
			"name":        "Visual Cron Job Manager",
			"version":     "1.1.0",
			"description": "Create, edit, and visualize scheduled crontab tasks with execution logs.",
			"author":      "YARE Community",
			"isEnabled":   true,
			"icon":        "Clock",
		},
	}
	c.JSON(http.StatusOK, plugins)
}

func (pc *PluginsController) TogglePlugin(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Plugin state toggled successfully", "id": id})
}
