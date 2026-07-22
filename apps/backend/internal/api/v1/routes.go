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
	networkCtrl := NewNetworkController()
	terminalCtrl := NewTerminalController()
	logsCtrl := NewLogsController()
	usersCtrl := NewUsersController()
	pluginsCtrl := NewPluginsController()
	settingsCtrl := NewSettingsController()
	auditCtrl := NewAuditController()
	proxyCtrl := NewProxyController()
	cronCtrl := NewCronController()
	backupsCtrl := NewBackupsController()
	alertsCtrl := NewAlertsController()
	appStoreCtrl := NewAppStoreController()

	v1 := r.Group("/api/v1")
	{
		// Public Auth Endpoints (5 login attempts per minute per IP)
		v1.POST("/auth/login", middleware.RateLimitMiddleware(5, 1*time.Minute), authCtrl.Login)
		v1.POST("/auth/refresh", authCtrl.Refresh)

		// Public WebSockets
		v1.GET("/ws/metrics", dashboardCtrl.StreamMetricsWS)
		v1.GET("/ws/terminal", terminalCtrl.HandleWebsocket)

		// Protected Endpoints
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.GET("/auth/me", authCtrl.Me)

			// App Store & GitHub Engine
			protected.GET("/appstore/curated", appStoreCtrl.GetCuratedApps)
			protected.GET("/appstore/github/search", appStoreCtrl.SearchGitHubRepos)
			protected.POST("/appstore/github/inspect", appStoreCtrl.InspectGitHubRepo)
			protected.POST("/appstore/deploy", middleware.RoleMiddleware("admin", "operator"), appStoreCtrl.DeployApp)
			protected.GET("/appstore/installed", appStoreCtrl.GetInstalledApps)
			protected.POST("/appstore/installed/:id/:action", middleware.RoleMiddleware("admin", "operator"), appStoreCtrl.AppAction)
			protected.GET("/appstore/installed/:id/logs", appStoreCtrl.GetAppLogs)

			// Dashboard & System
			protected.GET("/dashboard/stats", dashboardCtrl.GetStats)
			protected.GET("/system/info", systemCtrl.GetSystemDetails)

			// Audit Logs
			protected.GET("/audit-logs", auditCtrl.GetAuditLogs)

			// Proxy & Domain Manager
			protected.GET("/proxy/hosts", proxyCtrl.GetProxyHosts)
			protected.POST("/proxy/hosts", middleware.RoleMiddleware("admin", "operator"), proxyCtrl.CreateProxyHost)
			protected.DELETE("/proxy/hosts/:id", middleware.RoleMiddleware("admin", "operator"), proxyCtrl.DeleteProxyHost)
			protected.POST("/proxy/hosts/:id/ssl", middleware.RoleMiddleware("admin", "operator"), proxyCtrl.ToggleSSL)
			protected.GET("/proxy/hosts/:id/export", proxyCtrl.ExportNginxConfig)

			// Cron Jobs
			protected.GET("/cron", cronCtrl.GetCronJobs)
			protected.POST("/cron", middleware.RoleMiddleware("admin", "operator"), cronCtrl.CreateCronJob)
			protected.DELETE("/cron/:id", middleware.RoleMiddleware("admin", "operator"), cronCtrl.DeleteCronJob)
			protected.POST("/cron/:id/toggle", middleware.RoleMiddleware("admin", "operator"), cronCtrl.ToggleCronJob)
			protected.POST("/cron/:id/run", middleware.RoleMiddleware("admin", "operator"), cronCtrl.RunCronJobNow)

			// Backups & Disaster Recovery
			protected.GET("/backups", backupsCtrl.GetBackups)
			protected.POST("/backups/create", middleware.RoleMiddleware("admin", "operator"), backupsCtrl.CreateBackup)
			protected.GET("/backups/:id/download", backupsCtrl.DownloadBackup)
			protected.DELETE("/backups/:id", middleware.RoleMiddleware("admin"), backupsCtrl.DeleteBackup)

			// Alerting & Notifications
			protected.GET("/alerts/channels", alertsCtrl.GetChannels)
			protected.POST("/alerts/channels", middleware.RoleMiddleware("admin"), alertsCtrl.CreateChannel)
			protected.POST("/alerts/channels/:id/test", middleware.RoleMiddleware("admin"), alertsCtrl.TestChannel)
			protected.DELETE("/alerts/channels/:id", middleware.RoleMiddleware("admin"), alertsCtrl.DeleteChannel)
			protected.GET("/alerts/rules", alertsCtrl.GetRules)
			protected.POST("/alerts/rules", middleware.RoleMiddleware("admin"), alertsCtrl.CreateRule)
			protected.DELETE("/alerts/rules/:id", middleware.RoleMiddleware("admin"), alertsCtrl.DeleteRule)

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
