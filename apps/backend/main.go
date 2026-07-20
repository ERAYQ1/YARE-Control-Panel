package main

import (
	"log"
	"time"

	v1 "yare-backend/internal/api/v1"
	"yare-backend/internal/config"
	"yare-backend/internal/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	log.Printf("Starting YARE Panel Backend Server [Env: %s, Port: %s]...", cfg.Environment, cfg.Port)

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
			"name":    "YARE Control Panel Backend",
			"version": "1.0.0",
		})
	})

	log.Printf("YARE Panel API Server listening on http://0.0.0.0:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
