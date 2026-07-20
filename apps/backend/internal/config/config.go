package config

import (
	"os"

	"github.com/google/uuid"
)

type Config struct {
	Port         string
	JWTSecret    string
	DBPath       string
	Environment  string
	IsLinux      bool
	AllowOrigin  string
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
		dbPath = "yare.db"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	return &Config{
		Port:        port,
		JWTSecret:   jwtSecret,
		DBPath:      dbPath,
		Environment: env,
		AllowOrigin: "*",
	}
}
