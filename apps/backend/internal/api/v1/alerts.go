package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"yare-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type AlertsController struct{}

func NewAlertsController() *AlertsController {
	return &AlertsController{}
}

type AlertChannel struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	ChannelType string `json:"channel_type"` // "telegram", "discord", "slack", "webhook", "email"
	ConfigJSON  string `json:"config_json"`
	Enabled     bool   `json:"enabled"`
	CreatedAt   string `json:"created_at"`
}

type AlertRule struct {
	ID        string  `json:"id"`
	Metric    string  `json:"metric"`    // "cpu", "ram", "disk", "container_down"
	Condition string  `json:"condition"` // "gt", "lt", "eq"
	Threshold float64 `json:"threshold"`
	ChannelID string  `json:"channel_id"`
	Enabled   bool    `json:"enabled"`
	CreatedAt string  `json:"created_at"`
}

func (ac *AlertsController) GetChannels(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, channel_type, config_json, enabled, created_at FROM alert_channels ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alert channels"})
		return
	}
	defer rows.Close()

	channels := []AlertChannel{}
	for rows.Next() {
		var ch AlertChannel
		var en int
		if err := rows.Scan(&ch.ID, &ch.Name, &ch.ChannelType, &ch.ConfigJSON, &en, &ch.CreatedAt); err == nil {
			ch.Enabled = (en == 1)
			channels = append(channels, ch)
		}
	}

	c.JSON(http.StatusOK, gin.H{"channels": channels})
}

func (ac *AlertsController) CreateChannel(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		ChannelType string `json:"channel_type" binding:"required"`
		ConfigJSON  string `json:"config_json" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing channel configuration"})
		return
	}

	id := fmt.Sprintf("ch_%d", time.Now().UnixNano())
	_, err := database.DB.Exec(`INSERT INTO alert_channels (id, name, channel_type, config_json) VALUES (?, ?, ?, ?)`,
		id, req.Name, req.ChannelType, req.ConfigJSON)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save alert channel: " + err.Error()})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "CREATE_ALERT_CHANNEL", c.ClientIP(), "Created alert channel "+req.Name)

	c.JSON(http.StatusOK, gin.H{"message": "Alert channel created successfully", "id": id})
}

func (ac *AlertsController) TestChannel(c *gin.Context) {
	id := c.Param("id")
	var channelType, configJSON string
	err := database.DB.QueryRow(`SELECT channel_type, config_json FROM alert_channels WHERE id = ?`, id).Scan(&channelType, &configJSON)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert channel not found"})
		return
	}

	err = SendNotification(channelType, configJSON, "🚨 YARE Test Alert", "This is a test notification from your YARE Control Panel alerting engine.")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to send test alert: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Test notification dispatched successfully"})
}

func (ac *AlertsController) DeleteChannel(c *gin.Context) {
	id := c.Param("id")
	_, _ = database.DB.Exec(`DELETE FROM alert_channels WHERE id = ?`, id)
	_, _ = database.DB.Exec(`DELETE FROM alert_rules WHERE channel_id = ?`, id)

	c.JSON(http.StatusOK, gin.H{"message": "Alert channel deleted"})
}

func (ac *AlertsController) GetRules(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, metric, condition, threshold, channel_id, enabled, created_at FROM alert_rules ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alert rules"})
		return
	}
	defer rows.Close()

	rules := []AlertRule{}
	for rows.Next() {
		var r AlertRule
		var en int
		if err := rows.Scan(&r.ID, &r.Metric, &r.Condition, &r.Threshold, &r.ChannelID, &en, &r.CreatedAt); err == nil {
			r.Enabled = (en == 1)
			rules = append(rules, r)
		}
	}

	c.JSON(http.StatusOK, gin.H{"rules": rules})
}

func (ac *AlertsController) CreateRule(c *gin.Context) {
	var req struct {
		Metric    string  `json:"metric" binding:"required"`
		Condition string  `json:"condition" binding:"required"`
		Threshold float64 `json:"threshold"`
		ChannelID string  `json:"channel_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing alert rule parameters"})
		return
	}

	id := fmt.Sprintf("rule_%d", time.Now().UnixNano())
	_, err := database.DB.Exec(`INSERT INTO alert_rules (id, metric, condition, threshold, channel_id) VALUES (?, ?, ?, ?, ?)`,
		id, req.Metric, req.Condition, req.Threshold, req.ChannelID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create alert rule: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Alert rule created successfully", "id": id})
}

func (ac *AlertsController) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	_, _ = database.DB.Exec(`DELETE FROM alert_rules WHERE id = ?`, id)
	c.JSON(http.StatusOK, gin.H{"message": "Alert rule deleted"})
}

func SendNotification(channelType, configJSON, title, message string) error {
	var config map[string]string
	_ = json.Unmarshal([]byte(configJSON), &config)

	switch channelType {
	case "discord", "slack", "webhook":
		webhookURL := config["webhook_url"]
		if webhookURL == "" {
			return fmt.Errorf("missing webhook URL in config")
		}
		payload := map[string]string{"content": fmt.Sprintf("**%s**\n%s", title, message), "text": fmt.Sprintf("%s: %s", title, message)}
		body, _ := json.Marshal(payload)
		resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			return err
		}
		defer resp.Body.Close()
	case "telegram":
		botToken := config["bot_token"]
		chatID := config["chat_id"]
		if botToken == "" || chatID == "" {
			return fmt.Errorf("missing Telegram bot token or chat ID")
		}
		apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
		payload := map[string]string{"chat_id": chatID, "text": fmt.Sprintf("%s\n\n%s", title, message)}
		body, _ := json.Marshal(payload)
		resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			return err
		}
		defer resp.Body.Close()
	}
	return nil
}
