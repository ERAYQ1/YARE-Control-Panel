package v1

import (
	"net/http"

	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
)

type UsersController struct{}

func NewUsersController() *UsersController {
	return &UsersController{}
}

func (uc *UsersController) GetPanelUsers(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, username, email, role, two_factor_enabled, created_at, last_login FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var id, username, email, role, createdAt string
		var lastLogin *string
		var twoFactor int
		_ = rows.Scan(&id, &username, &email, &role, &twoFactor, &createdAt, &lastLogin)

		users = append(users, gin.H{
			"id":               id,
			"username":         username,
			"email":            email,
			"role":             role,
			"twoFactorEnabled": twoFactor == 1,
			"createdAt":        createdAt,
			"lastLogin":        lastLogin,
		})
	}

	c.JSON(http.StatusOK, users)
}

func (uc *UsersController) GetLinuxUsers(c *gin.Context) {
	linuxUsers := []gin.H{
		{"username": "root", "uid": 0, "gid": 0, "homeDir": "/root", "shell": "/bin/bash", "groups": []string{"root"}, "isLocked": false},
		{"username": "yare", "uid": 1000, "gid": 1000, "homeDir": "/home/yare", "shell": "/bin/bash", "groups": []string{"yare", "sudo", "docker"}, "isLocked": false},
		{"username": "www-data", "uid": 33, "gid": 33, "homeDir": "/var/www", "shell": "/usr/sbin/nologin", "groups": []string{"www-data"}, "isLocked": true},
		{"username": "postgres", "uid": 105, "gid": 111, "homeDir": "/var/lib/postgresql", "shell": "/bin/bash", "groups": []string{"postgres"}, "isLocked": false},
	}
	c.JSON(http.StatusOK, linuxUsers)
}

func (uc *UsersController) GetSSHKeys(c *gin.Context) {
	sshKeys := []gin.H{
		{"id": "ssh-1", "name": "Workstation Laptop (RSA)", "fingerprint": "SHA256:uN89xLkPq2Z...", "publicKey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...", "addedAt": "2026-07-01 09:30:00"},
		{"id": "ssh-2", "name": "CI/CD Deployment Key (ED25519)", "fingerprint": "SHA256:7vK9mLx0P1a...", "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH...", "addedAt": "2026-07-10 14:15:00"},
	}
	c.JSON(http.StatusOK, sshKeys)
}
