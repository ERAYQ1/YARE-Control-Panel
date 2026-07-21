package v1

import (
	"fmt"
	"net/http"
	"os/exec"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
	gopsnet "github.com/shirou/gopsutil/v3/net"
)

type NetworkController struct{}

func NewNetworkController() *NetworkController {
	return &NetworkController{}
}

func (nc *NetworkController) GetInterfaces(c *gin.Context) {
	netInterfaces, err := gopsnet.Interfaces()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enumerate network interfaces: " + err.Error()})
		return
	}

	ioCounters, _ := gopsnet.IOCounters(true)
	ioMap := make(map[string]gopsnet.IOCountersStat)
	for _, io := range ioCounters {
		ioMap[io.Name] = io
	}

	var interfaces []gin.H
	for _, iface := range netInterfaces {
		var ipAddr string
		if len(iface.Addrs) > 0 {
			ipAddr = iface.Addrs[0].Addr
		}
		isUp := false
		for _, flag := range iface.Flags {
			if flag == "up" {
				isUp = true
				break
			}
		}

		var rxBytes, txBytes uint64
		if ioStat, ok := ioMap[iface.Name]; ok {
			rxBytes = ioStat.BytesRecv
			txBytes = ioStat.BytesSent
		}

		interfaces = append(interfaces, gin.H{
			"name":       iface.Name,
			"ipAddress":  ipAddr,
			"macAddress": iface.HardwareAddr,
			"isUp":       isUp,
			"rxBytes":    rxBytes,
			"txBytes":    txBytes,
			"speed":      "Auto-Negotiated",
		})
	}

	c.JSON(http.StatusOK, interfaces)
}

func (nc *NetworkController) GetOpenPorts(c *gin.Context) {
	connections, err := gopsnet.Connections("tcp")
	var openPorts []gin.H

	if err == nil {
		seenPorts := make(map[uint32]bool)
		for _, conn := range connections {
			if conn.Status == "LISTEN" && conn.Laddr.Port > 0 {
				if seenPorts[conn.Laddr.Port] {
					continue
				}
				seenPorts[conn.Laddr.Port] = true

				openPorts = append(openPorts, gin.H{
					"port":        conn.Laddr.Port,
					"protocol":    "TCP",
					"processName": fmt.Sprintf("PID %d", conn.Pid),
					"pid":         conn.Pid,
					"state":       "LISTEN",
					"user":        "system",
				})
			}
		}
	}

	c.JSON(http.StatusOK, openPorts)
}

func (nc *NetworkController) GetFirewallRules(c *gin.Context) {
	status := "inactive"
	var rules []gin.H

	if runtime.GOOS == "linux" {
		cmd := exec.Command("ufw", "status", "numbered")
		output, err := cmd.Output()
		if err == nil {
			outStr := string(output)
			if strings.Contains(outStr, "Status: active") {
				status = "active"
				lines := strings.Split(outStr, "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if strings.HasPrefix(line, "[") {
						parts := strings.Fields(line)
						if len(parts) >= 3 {
							ruleID := strings.Trim(parts[0], "[]")
							action := parts[2]
							toPort := parts[1]
							rules = append(rules, gin.H{
								"id":       ruleID,
								"action":   action,
								"from":     "Anywhere",
								"toPort":   toPort,
								"protocol": "TCP/UDP",
								"comment":  "System UFW Rule",
							})
						}
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": status,
		"rules":  rules,
	})
}
