package v1

import (
	"bufio"
	"database/sql"
	"net/http"
	"os"
	"os/user"
	"runtime"
	"strconv"
	"strings"

	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
)

type UsersController struct{}

func NewUsersController() *UsersController {
	return &UsersController{}
}

func (uc *UsersController) GetPanelUsers(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, username, email, role, two_factor_enabled, created_at, last_login FROM users ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var id, username, email, role, createdAt string
		var lastLogin sql.NullString
		var twoFactor int
		_ = rows.Scan(&id, &username, &email, &role, &twoFactor, &createdAt, &lastLogin)

		users = append(users, gin.H{
			"id":               id,
			"username":         username,
			"email":            email,
			"role":             role,
			"twoFactorEnabled": twoFactor == 1,
			"createdAt":        createdAt,
			"lastLogin":        lastLogin.String,
		})
	}

	c.JSON(http.StatusOK, users)
}

func (uc *UsersController) GetLinuxUsers(c *gin.Context) {
	var linuxUsers []gin.H

	if runtime.GOOS == "linux" {
		file, err := os.Open("/etc/passwd")
		if err == nil {
			defer file.Close()
			scanner := bufio.NewScanner(file)
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
					continue
				}
				parts := strings.Split(line, ":")
				if len(parts) >= 7 {
					uid, _ := strconv.Atoi(parts[2])
					gid, _ := strconv.Atoi(parts[3])
					shell := parts[6]
					isLocked := strings.Contains(shell, "nologin") || strings.Contains(shell, "false")

					linuxUsers = append(linuxUsers, gin.H{
						"username": parts[0],
						"uid":      uid,
						"gid":      gid,
						"homeDir":  parts[5],
						"shell":    shell,
						"groups":   []string{parts[0]},
						"isLocked": isLocked,
					})
				}
			}
		}
	}

	if len(linuxUsers) == 0 {
		// Fallback to current host execution user
		currUser, err := user.Current()
		if err == nil {
			uid, _ := strconv.Atoi(currUser.Uid)
			gid, _ := strconv.Atoi(currUser.Gid)
			linuxUsers = append(linuxUsers, gin.H{
				"username": currUser.Username,
				"uid":      uid,
				"gid":      gid,
				"homeDir":  currUser.HomeDir,
				"shell":    "N/A",
				"groups":   []string{currUser.Username},
				"isLocked": false,
			})
		}
	}

	c.JSON(http.StatusOK, linuxUsers)
}

func (uc *UsersController) GetSSHKeys(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, name, fingerprint, public_key, added_at FROM ssh_keys ORDER BY added_at DESC")
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}
	defer rows.Close()

	var sshKeys []gin.H
	for rows.Next() {
		var id, name, fingerprint, publicKey, addedAt string
		if err := rows.Scan(&id, &name, &fingerprint, &publicKey, &addedAt); err == nil {
			sshKeys = append(sshKeys, gin.H{
				"id":          id,
				"name":        name,
				"fingerprint": fingerprint,
				"publicKey":   publicKey,
				"addedAt":     addedAt,
			})
		}
	}

	c.JSON(http.StatusOK, sshKeys)
}
