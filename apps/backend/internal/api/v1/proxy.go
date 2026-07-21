package v1

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"yare-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type ProxyController struct{}

func NewProxyController() *ProxyController {
	return &ProxyController{}
}

type ProxyHost struct {
	ID         string `json:"id"`
	Domain     string `json:"domain"`
	TargetURL  string `json:"target_url"`
	SSLEnabled bool   `json:"ssl_enabled"`
	SSLAuto    bool   `json:"ssl_auto"`
	CertPath   string `json:"cert_path"`
	KeyPath    string `json:"key_path"`
	CreatedAt  string `json:"created_at"`
}

func (pc *ProxyController) GetProxyHosts(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, domain, target_url, ssl_enabled, ssl_auto, cert_path, key_path, created_at FROM proxy_hosts ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch proxy hosts: " + err.Error()})
		return
	}
	defer rows.Close()

	hosts := []ProxyHost{}
	for rows.Next() {
		var h ProxyHost
		var sslEn, sslAut int
		if err := rows.Scan(&h.ID, &h.Domain, &h.TargetURL, &sslEn, &sslAut, &h.CertPath, &h.KeyPath, &h.CreatedAt); err == nil {
			h.SSLEnabled = (sslEn == 1)
			h.SSLAuto = (sslAut == 1)
			hosts = append(hosts, h)
		}
	}

	c.JSON(http.StatusOK, gin.H{"hosts": hosts})
}

func (pc *ProxyController) CreateProxyHost(c *gin.Context) {
	var req struct {
		Domain    string `json:"domain" binding:"required"`
		TargetURL string `json:"target_url" binding:"required"`
		SSLAuto   bool   `json:"ssl_auto"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request parameters"})
		return
	}

	// Validate target URL
	if _, err := url.ParseRequestURI(req.TargetURL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target URL format"})
		return
	}

	id := "px_" + strings.ReplaceAll(req.Domain, ".", "_")
	sslAutoVal := 0
	if req.SSLAuto {
		sslAutoVal = 1
	}

	_, err := database.DB.Exec(`INSERT INTO proxy_hosts (id, domain, target_url, ssl_auto) VALUES (?, ?, ?, ?)`,
		id, req.Domain, req.TargetURL, sslAutoVal)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Domain proxy host already exists or failed to save"})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "CREATE_PROXY_HOST", c.ClientIP(), fmt.Sprintf("Added domain proxy %s -> %s", req.Domain, req.TargetURL))

	c.JSON(http.StatusOK, gin.H{"message": "Proxy host added successfully", "id": id})
}

func (pc *ProxyController) DeleteProxyHost(c *gin.Context) {
	id := c.Param("id")
	res, err := database.DB.Exec(`DELETE FROM proxy_hosts WHERE id = ?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete proxy host"})
		return
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proxy host not found"})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "DELETE_PROXY_HOST", c.ClientIP(), "Deleted proxy host ID "+id)

	c.JSON(http.StatusOK, gin.H{"message": "Proxy host deleted successfully"})
}

func (pc *ProxyController) ToggleSSL(c *gin.Context) {
	id := c.Param("id")
	var row ProxyHost
	var sslEn int
	err := database.DB.QueryRow(`SELECT id, domain, ssl_enabled FROM proxy_hosts WHERE id = ?`, id).Scan(&row.ID, &row.Domain, &sslEn)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proxy host not found"})
		return
	}

	newSSLState := 1
	if sslEn == 1 {
		newSSLState = 0
	}

	_, err = database.DB.Exec(`UPDATE proxy_hosts SET ssl_enabled = ? WHERE id = ?`, newSSLState, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update SSL state"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "SSL state updated successfully", "ssl_enabled": (newSSLState == 1)})
}

func (pc *ProxyController) ExportNginxConfig(c *gin.Context) {
	id := c.Param("id")
	var domain, targetURL string
	var sslEnabled int
	err := database.DB.QueryRow(`SELECT domain, target_url, ssl_enabled FROM proxy_hosts WHERE id = ?`, id).Scan(&domain, &targetURL, &sslEnabled)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proxy host not found"})
		return
	}

	listenPort := "80"
	sslConfig := ""
	if sslEnabled == 1 {
		listenPort = "443 ssl http2"
		sslConfig = fmt.Sprintf(`
    ssl_certificate /etc/letsencrypt/live/%s/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/%s/privkey.pem;
`, domain, domain)
	}

	configStr := fmt.Sprintf(`server {
    listen %s;
    server_name %s;
%s
    location / {
        proxy_pass %s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`, listenPort, domain, sslConfig, targetURL)

	c.JSON(http.StatusOK, gin.H{
		"domain": domain,
		"config": configStr,
	})
}
