package config

import (
	"os"
	"runtime"

	"github.com/google/uuid"
)

type Config struct {
	Port        string
	JWTSecret   string
	DBPath      string
	Environment string
	IsLinux     bool
	AllowOrigin string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "yare_secret_key_" + uuid.New().String()
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		if runtime.GOOS == "linux" && os.Getuid() == 0 {
			dbPath = "/opt/yare/yare.db"
		} else {
			dbPath = "yare.db"
		}
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "production"
	}

	return &Config{
		Port:        port,
		JWTSecret:   jwtSecret,
		DBPath:      dbPath,
		Environment: env,
		AllowOrigin: "*",
	}
}
