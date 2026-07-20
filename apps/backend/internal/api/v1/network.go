package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type NetworkController struct{}

func NewNetworkController() *NetworkController {
	return &NetworkController{}
}

func (nc *NetworkController) GetInterfaces(c *gin.Context) {
	interfaces := []gin.H{
		{
			"name":       "eth0",
			"ipAddress":  "192.168.1.120 / 24",
			"macAddress": "02:42:ac:11:00:02",
			"isUp":       true,
			"rxBytes":    1024 * 1024 * 1450,
			"txBytes":    1024 * 1024 * 820,
			"speed":      "10000 Mbps",
		},
		{
			"name":       "docker0",
			"ipAddress":  "172.17.0.1 / 16",
			"macAddress": "02:42:be:89:12:ef",
			"isUp":       true,
			"rxBytes":    1024 * 1024 * 210,
			"txBytes":    1024 * 1024 * 180,
			"speed":      "Virtual",
		},
		{
			"name":       "lo",
			"ipAddress":  "127.0.0.1 / 8",
			"macAddress": "00:00:00:00:00:00",
			"isUp":       true,
			"rxBytes":    1024 * 1024 * 540,
			"txBytes":    1024 * 1024 * 540,
			"speed":      "Loopback",
		},
	}
	c.JSON(http.StatusOK, interfaces)
}

func (nc *NetworkController) GetOpenPorts(c *gin.Context) {
	openPorts := []gin.H{
		{"port": 22, "protocol": "TCP", "processName": "sshd", "pid": 712, "state": "LISTEN", "user": "root"},
		{"port": 80, "protocol": "TCP", "processName": "nginx", "pid": 844, "state": "LISTEN", "user": "www-data"},
		{"port": 443, "protocol": "TCP", "processName": "nginx", "pid": 844, "state": "LISTEN", "user": "www-data"},
		{"port": 8080, "protocol": "TCP", "processName": "yare-backend", "pid": 1894, "state": "LISTEN", "user": "yare"},
		{"port": 5432, "protocol": "TCP", "processName": "postgres", "pid": 3120, "state": "LISTEN", "user": "postgres"},
		{"port": 6379, "protocol": "TCP", "processName": "redis-server", "pid": 4051, "state": "LISTEN", "user": "redis"},
	}
	c.JSON(http.StatusOK, openPorts)
}

func (nc *NetworkController) GetFirewallRules(c *gin.Context) {
	rules := []gin.H{
		{"id": "1", "action": "ALLOW", "from": "Anywhere", "toPort": "22/tcp", "protocol": "TCP", "comment": "SSH Access"},
		{"id": "2", "action": "ALLOW", "from": "Anywhere", "toPort": "80/tcp", "protocol": "TCP", "comment": "HTTP Web"},
		{"id": "3", "action": "ALLOW", "from": "Anywhere", "toPort": "443/tcp", "protocol": "TCP", "comment": "HTTPS Web"},
		{"id": "4", "action": "ALLOW", "from": "192.168.1.0/24", "toPort": "8080/tcp", "protocol": "TCP", "comment": "YARE Panel Management"},
		{"id": "5", "action": "DENY", "from": "Anywhere", "toPort": "5432/tcp", "protocol": "TCP", "comment": "Block External Postgres"},
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "active",
		"rules":  rules,
	})
}
