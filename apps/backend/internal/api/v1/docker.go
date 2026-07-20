package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type DockerController struct{}

func NewDockerController() *DockerController {
	return &DockerController{}
}

func (dc *DockerController) GetContainers(c *gin.Context) {
	containers := []gin.H{
		{
			"id":          "c8f1e290a1b2",
			"name":        "yare-web-app",
			"image":       "yare/panel:latest",
			"status":      "Up 3 days (healthy)",
			"state":       "running",
			"created":     "2026-07-17 10:00:00",
			"ports":       []string{"0.0.0.0:8080->8080/tcp"},
			"cpuUsage":    1.2,
			"memoryUsage": 45 * 1024 * 1024,
			"memoryLimit": 512 * 1024 * 1024,
		},
		{
			"id":          "a1b2c3d4e5f6",
			"name":        "production-postgres",
			"image":       "postgres:16-alpine",
			"status":      "Up 5 days",
			"state":       "running",
			"created":     "2026-07-15 14:20:00",
			"ports":       []string{"127.0.0.1:5432->5432/tcp"},
			"cpuUsage":    0.8,
			"memoryUsage": 180 * 1024 * 1024,
			"memoryLimit": 2048 * 1024 * 1024,
		},
		{
			"id":          "f9e8d7c6b5a4",
			"name":        "redis-cache",
			"image":       "redis:7-alpine",
			"status":      "Up 5 days",
			"state":       "running",
			"created":     "2026-07-15 14:22:00",
			"ports":       []string{"127.0.0.1:6379->6379/tcp"},
			"cpuUsage":    0.3,
			"memoryUsage": 38 * 1024 * 1024,
			"memoryLimit": 1024 * 1024 * 1024,
		},
		{
			"id":          "b5c6d7e8f9a0",
			"name":        "nginx-ingress-proxy",
			"image":       "nginx:mainline-alpine",
			"status":      "Up 2 weeks",
			"state":       "running",
			"created":     "2026-07-06 08:15:00",
			"ports":       []string{"0.0.0.0:80->80/tcp", "0.0.0.0:443->443/tcp"},
			"cpuUsage":    2.5,
			"memoryUsage": 24 * 1024 * 1024,
			"memoryLimit": 256 * 1024 * 1024,
		},
		{
			"id":          "9a8b7c6d5e4f",
			"name":        "analytics-worker-temp",
			"image":       "python:3.11-slim",
			"status":      "Exited (0) 2 hours ago",
			"state":       "exited",
			"created":     "2026-07-20 12:00:00",
			"ports":       []string{},
			"cpuUsage":    0.0,
			"memoryUsage": 0,
			"memoryLimit": 512 * 1024 * 1024,
		},
	}

	c.JSON(http.StatusOK, containers)
}

func (dc *DockerController) GetImages(c *gin.Context) {
	images := []gin.H{
		{"id": "sha256:e9d1", "repository": "yare/panel", "tag": "latest", "size": 184000000, "created": "3 days ago"},
		{"id": "sha256:a4b2", "repository": "postgres", "tag": "16-alpine", "size": 240000000, "created": "2 weeks ago"},
		{"id": "sha256:f5c8", "repository": "redis", "tag": "7-alpine", "size": 35000000, "created": "1 month ago"},
		{"id": "sha256:7b9e", "repository": "nginx", "tag": "mainline-alpine", "size": 42000000, "created": "1 month ago"},
		{"id": "sha256:3c1f", "repository": "ubuntu", "tag": "24.04", "size": 78000000, "created": "2 months ago"},
	}
	c.JSON(http.StatusOK, images)
}

func (dc *DockerController) GetVolumes(c *gin.Context) {
	volumes := []gin.H{
		{"name": "postgres_data", "driver": "local", "mountpoint": "/var/lib/docker/volumes/postgres_data/_data", "created": "2026-07-15"},
		{"name": "redis_data", "driver": "local", "mountpoint": "/var/lib/docker/volumes/redis_data/_data", "created": "2026-07-15"},
		{"name": "nginx_logs", "driver": "local", "mountpoint": "/var/lib/docker/volumes/nginx_logs/_data", "created": "2026-07-06"},
	}
	c.JSON(http.StatusOK, volumes)
}

func (dc *DockerController) GetNetworks(c *gin.Context) {
	networks := []gin.H{
		{"id": "bridge01", "name": "bridge", "driver": "bridge", "scope": "local"},
		{"id": "host01", "name": "host", "driver": "host", "scope": "local"},
		{"id": "none01", "name": "none", "driver": "null", "scope": "local"},
		{"id": "yare_net", "name": "yare_default", "driver": "bridge", "scope": "local"},
	}
	c.JSON(http.StatusOK, networks)
}

func (dc *DockerController) ContainerAction(c *gin.Context) {
	id := c.Param("id")
	action := c.Param("action") // start, stop, restart, delete

	c.JSON(http.StatusOK, gin.H{
		"message":   "Container action executed successfully",
		"container": id,
		"action":    action,
	})
}
