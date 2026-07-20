package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type SettingsController struct{}

func NewSettingsController() *SettingsController {
	return &SettingsController{}
}

func (sc *SettingsController) GetSettings(c *gin.Context) {
	settings := gin.H{
		"theme":          "dark",
		"language":       "en",
		"updateChannel":  "stable",
		"timezone":       "UTC (+03:00 Europe/Istanbul)",
		"sessionTimeout": 1440,
		"security": gin.H{
			"rateLimiting":     true,
			"rateLimitMax":     100,
			"jwtExpirationHrs": 24,
			"auditLogRetention": 30,
			"require2FA":       false,
		},
		"version": "1.0.0",
	}
	c.JSON(http.StatusOK, settings)
}

func (sc *SettingsController) SaveSettings(c *gin.Context) {
	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully", "data": payload})
}
