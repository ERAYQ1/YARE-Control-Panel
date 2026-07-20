package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"time"

	v1 "yare-backend/internal/api/v1"
	"yare-backend/internal/config"
	"yare-backend/internal/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

//go:embed dist/*
var embeddedFrontend embed.FS

func main() {
	cfg := config.LoadConfig()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	log.Printf("Starting YARE Panel Engine [Env: %s, Port: %s]...", cfg.Environment, cfg.Port)

	// Ensure database directory exists
	_ = os.MkdirAll("/opt/yare", 0755)

	// Initialize SQLite Database
	database.InitDB(cfg.DBPath)

	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Register API v1 routes
	v1.RegisterRoutes(r, cfg.JWTSecret)

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"name":    "YARE Control Panel Engine",
			"version": "1.0.0",
		})
	})

	// Serve Frontend SPA (Static Embed / Fallback)
	frontendFS, err := fs.Sub(embeddedFrontend, "dist")
	if err == nil {
		r.NoRoute(func(c *gin.Context) {
			path := c.Request.URL.Path
			// If file exists in embedded FS, serve it, otherwise serve index.html
			f, err := frontendFS.Open(path[1:])
			if err == nil {
				_ = f.Close()
				http.FileServer(http.FS(frontendFS)).ServeHTTP(c.Writer, c.Request)
				return
			}
			c.FileFromFS("", http.FS(frontendFS))
		})
	}

	log.Printf("YARE Panel listening on http://0.0.0.0:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
