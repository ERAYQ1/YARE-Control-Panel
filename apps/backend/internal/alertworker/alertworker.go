package alertworker

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"yare-backend/internal/database"
	"yare-backend/internal/system"
)

type AlertRule struct {
	ID        string  `json:"id"`
	Metric    string  `json:"metric"`    // "cpu", "memory", "disk"
	Condition string  `json:"condition"` // ">", "<", ">="
	Threshold float64 `json:"threshold"`
	ChannelID string  `json:"channel_id"`
}

type AlertChannel struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	ChannelType string `json:"channel_type"` // "webhook", "email"
	ConfigJSON  string `json:"config_json"`  // `{"url": "https://..."}`
}

var lastTriggered = make(map[string]time.Time)

// StartAlertMonitor starts background metric polling to evaluate alert rules
func StartAlertMonitor() {
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()

		log.Println("[ALERT WORKER] Background Alert Monitoring Worker initialized.")

		for range ticker.C {
			evaluateAlertRules()
		}
	}()
}

func evaluateAlertRules() {
	if database.DB == nil {
		return
	}

	metrics := system.CollectMetrics()
	if metrics == nil {
		return
	}

	rows, err := database.DB.Query(`SELECT id, metric, condition, threshold, channel_id FROM alert_rules WHERE enabled = 1`)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var rule AlertRule
		if err := rows.Scan(&rule.ID, &rule.Metric, &rule.Condition, &rule.Threshold, &rule.ChannelID); err != nil {
			continue
		}

		val := getMetricValue(rule.Metric, metrics)
		if isThresholdBreached(val, rule.Condition, rule.Threshold) {
			// Cooldown of 5 minutes per rule to prevent notification spam
			if last, exists := lastTriggered[rule.ID]; exists && time.Since(last) < 5*time.Minute {
				continue
			}

			lastTriggered[rule.ID] = time.Now()
			go sendAlertNotification(rule, val)
		}
	}
}

func getMetricValue(metric string, m *system.SystemMetrics) float64 {
	switch metric {
	case "cpu":
		return m.CPU.UsagePercent
	case "memory", "ram":
		return m.Memory.UsagePercent
	case "disk":
		return m.Disk.UsagePercent
	default:
		return 0
	}
}

func isThresholdBreached(val float64, condition string, threshold float64) bool {
	switch condition {
	case ">":
		return val > threshold
	case ">=":
		return val >= threshold
	case "<":
		return val < threshold
	case "<=":
		return val <= threshold
	default:
		return val > threshold
	}
}

func sendAlertNotification(rule AlertRule, val float64) {
	var ch AlertChannel
	err := database.DB.QueryRow(`SELECT id, name, channel_type, config_json FROM alert_channels WHERE id = ? AND enabled = 1`, rule.ChannelID).Scan(
		&ch.ID, &ch.Name, &ch.ChannelType, &ch.ConfigJSON,
	)
	if err != nil {
		return
	}

	var config map[string]string
	_ = json.Unmarshal([]byte(ch.ConfigJSON), &config)
	targetURL := config["url"]
	if targetURL == "" {
		targetURL = config["webhook_url"]
	}

	if targetURL == "" {
		return
	}

	message := fmt.Sprintf("⚠️ [YARE ALERT] Metric '%s' breached threshold (Current: %.1f%% %s %.1f%%)",
		rule.Metric, val, rule.Condition, rule.Threshold)

	log.Printf("[ALERT WORKER] Triggering alert for channel %s (%s): %s", ch.Name, ch.ChannelType, message)

	payload := map[string]string{
		"content": message,
		"text":    message,
		"message": message,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err == nil && resp != nil {
		_ = resp.Body.Close()
	}
}
