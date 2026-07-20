package v1

import (
	"time"

	"yare-backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, jwtSecret string) {
	// Apply Global Security Headers & Rate Limiting (120 req / 1 minute)
	r.Use(middleware.SecurityHeadersMiddleware())
	r.Use(middleware.RateLimitMiddleware(120, 1*time.Minute))

	authCtrl := NewAuthController(jwtSecret)
	dashboardCtrl := NewDashboardController()
	systemCtrl := NewSystemController()
	fileManagerCtrl := NewFileManagerController()
	servicesCtrl := NewServicesController()
	dockerCtrl := NewDockerController()
	networkCtrl := NewNetworkController()
	terminalCtrl := NewTerminalController()
	logsCtrl := NewLogsController()
	usersCtrl := NewUsersController()
	pluginsCtrl := NewPluginsController()
	settingsCtrl := NewSettingsController()

	v1 := r.Group("/api/v1")
	{
		// Public Auth Endpoints
		v1.POST("/auth/login", authCtrl.Login)
		v1.POST("/auth/refresh", authCtrl.Refresh)

		// Public WebSockets
		v1.GET("/ws/metrics", dashboardCtrl.StreamMetricsWS)
		v1.GET("/ws/terminal", terminalCtrl.HandleWebsocket)

		// Protected Endpoints
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.GET("/auth/me", authCtrl.Me)

			// Dashboard & System
			protected.GET("/dashboard/stats", dashboardCtrl.GetStats)
			protected.GET("/system/info", systemCtrl.GetSystemDetails)

			// File Manager
			protected.GET("/files/list", fileManagerCtrl.ListFiles)
			protected.GET("/files/content", fileManagerCtrl.ReadFileContent)
			protected.POST("/files/save", fileManagerCtrl.SaveFileContent)
			protected.POST("/files/create", fileManagerCtrl.CreateItem)
			protected.DELETE("/files/delete", fileManagerCtrl.DeleteItem)
			protected.POST("/files/chmod", fileManagerCtrl.ChmodItem)
			protected.POST("/files/upload", fileManagerCtrl.UploadFile)
			protected.POST("/files/zip", fileManagerCtrl.CompressZip)

			// Services
			protected.GET("/services", servicesCtrl.ListServices)
			protected.POST("/services/:name/:action", middleware.RoleMiddleware("admin", "operator"), servicesCtrl.ServiceAction)

			// Docker
			protected.GET("/docker/containers", dockerCtrl.GetContainers)
			protected.GET("/docker/images", dockerCtrl.GetImages)
			protected.GET("/docker/volumes", dockerCtrl.GetVolumes)
			protected.GET("/docker/networks", dockerCtrl.GetNetworks)
			protected.POST("/docker/containers/:id/:action", middleware.RoleMiddleware("admin", "operator"), dockerCtrl.ContainerAction)

			// Network
			protected.GET("/network/interfaces", networkCtrl.GetInterfaces)
			protected.GET("/network/ports", networkCtrl.GetOpenPorts)
			protected.GET("/network/firewall", networkCtrl.GetFirewallRules)

			// Logs
			protected.GET("/logs", logsCtrl.GetLogs)

			// Users
			protected.GET("/users/panel", usersCtrl.GetPanelUsers)
			protected.GET("/users/linux", usersCtrl.GetLinuxUsers)
			protected.GET("/users/ssh-keys", usersCtrl.GetSSHKeys)

			// Plugins
			protected.GET("/plugins", pluginsCtrl.ListPlugins)
			protected.POST("/plugins/:id/toggle", middleware.RoleMiddleware("admin"), pluginsCtrl.TogglePlugin)

			// Settings
			protected.GET("/settings", settingsCtrl.GetSettings)
			protected.POST("/settings", middleware.RoleMiddleware("admin"), settingsCtrl.SaveSettings)
		}
	}
}
