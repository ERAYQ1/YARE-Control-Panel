package v1

import (
	"net/http"
	"strconv"

	"yare-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type AuditController struct{}

func NewAuditController() *AuditController {
	return &AuditController{}
}

type AuditLogItem struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Action    string `json:"action"`
	IPAddress string `json:"ip_address"`
	Details   string `json:"details"`
	CreatedAt string `json:"created_at"`
}

func (ac *AuditController) GetAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit

	query := `SELECT id, username, action, ip_address, details, created_at FROM audit_logs`
	args := []interface{}{}

	if search != "" {
		query += ` WHERE username LIKE ? OR action LIKE ? OR ip_address LIKE ? OR details LIKE ?`
		pattern := "%" + search + "%"
		args = append(args, pattern, pattern, pattern, pattern)
	}

	query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	args = append(args, limit, offset)

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs: " + err.Error()})
		return
	}
	defer rows.Close()

	logs := []AuditLogItem{}
	for rows.Next() {
		var item AuditLogItem
		if err := rows.Scan(&item.ID, &item.Username, &item.Action, &item.IPAddress, &item.Details, &item.CreatedAt); err == nil {
			logs = append(logs, item)
		}
	}

	// Count total
	var total int
	countQuery := `SELECT COUNT(*) FROM audit_logs`
	if search != "" {
		countQuery += ` WHERE username LIKE ? OR action LIKE ? OR ip_address LIKE ? OR details LIKE ?`
		pattern := "%" + search + "%"
		database.DB.QueryRow(countQuery, pattern, pattern, pattern, pattern).Scan(&total)
	} else {
		database.DB.QueryRow(countQuery).Scan(&total)
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
