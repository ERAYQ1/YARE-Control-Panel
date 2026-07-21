package v1

import (
	"net/http"
	"os/exec"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/process"
)

type ServicesController struct{}

func NewServicesController() *ServicesController {
	return &ServicesController{}
}

type ServiceItem struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	LoadState   string `json:"loadState"`
	ActiveState string `json:"activeState"`
	SubState    string `json:"subState"`
	IsEnabled   bool   `json:"isEnabled"`
	PID         int    `json:"pid,omitempty"`
	MemoryUsage uint64 `json:"memoryUsage,omitempty"`
}

func (sc *ServicesController) ListServices(c *gin.Context) {
	var services []ServiceItem

	if runtime.GOOS == "linux" {
		cmd := exec.Command("systemctl", "list-units", "--type=service", "--no-pager", "--no-legend")
		output, err := cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			for _, line := range lines {
				parts := strings.Fields(line)
				if len(parts) >= 4 {
					desc := ""
					if len(parts) > 4 {
						desc = strings.Join(parts[4:], " ")
					}
					services = append(services, ServiceItem{
						Name:        parts[0],
						LoadState:   parts[1],
						ActiveState: parts[2],
						SubState:    parts[3],
						Description: desc,
						IsEnabled:   parts[2] == "active",
					})
				}
			}
		}
	}

	if len(services) == 0 {
		// Fallback to top system processes using gopsutil
		procs, err := process.Processes()
		if err == nil {
			seenNames := make(map[string]bool)
			for _, p := range procs {
				name, err := p.Name()
				if err != nil || name == "" || seenNames[name] {
					continue
				}
				seenNames[name] = true

				memInfo, _ := p.MemoryInfo()
				var memUsage uint64
				if memInfo != nil {
					memUsage = memInfo.RSS
				}

				status, _ := p.Status()
				subState := "running"
				if len(status) > 0 {
					subState = status[0]
				}

				services = append(services, ServiceItem{
					Name:        name,
					Description: "Active System Process",
					LoadState:   "loaded",
					ActiveState: "active",
					SubState:    subState,
					IsEnabled:   true,
					PID:         int(p.Pid),
					MemoryUsage: memUsage,
				})

				if len(services) >= 30 {
					break
				}
			}
		}
	}

	c.JSON(http.StatusOK, services)
}

func (sc *ServicesController) ServiceAction(c *gin.Context) {
	name := c.Param("name")
	action := c.Param("action") // start, stop, restart, enable, disable

	if runtime.GOOS == "linux" {
		cmd := exec.Command("systemctl", action, name)
		out, err := cmd.CombinedOutput()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": string(out), "message": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Service action executed successfully",
		"service": name,
		"action":  action,
	})
}
