package v1

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type DockerController struct{}

func NewDockerController() *DockerController {
	return &DockerController{}
}

type DockerContainerJSON struct {
	ID         string `json:"ID"`
	Names      string `json:"Names"`
	Image      string `json:"Image"`
	Status     string `json:"Status"`
	State      string `json:"State"`
	CreatedAt  string `json:"CreatedAt"`
	Ports      string `json:"Ports"`
}

func (dc *DockerController) GetContainers(c *gin.Context) {
	cmd := exec.Command("docker", "ps", "-a", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var containers []gin.H

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var item DockerContainerJSON
		if err := json.Unmarshal([]byte(line), &item); err == nil {
			var portsList []string
			if item.Ports != "" {
				portsList = strings.Split(item.Ports, ", ")
			}
			containers = append(containers, gin.H{
				"id":          item.ID,
				"name":        strings.TrimPrefix(item.Names, "/"),
				"image":       item.Image,
				"status":      item.Status,
				"state":       item.State,
				"created":     item.CreatedAt,
				"ports":       portsList,
				"cpuUsage":    0.0,
				"memoryUsage": 0,
				"memoryLimit": 0,
			})
		}
	}

	c.JSON(http.StatusOK, containers)
}

func (dc *DockerController) GetImages(c *gin.Context) {
	cmd := exec.Command("docker", "images", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var images []gin.H

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var raw map[string]interface{}
		if err := json.Unmarshal([]byte(line), &raw); err == nil {
			images = append(images, gin.H{
				"id":         raw["ID"],
				"repository": raw["Repository"],
				"tag":        raw["Tag"],
				"size":       raw["Size"],
				"created":    raw["CreatedAt"],
			})
		}
	}

	c.JSON(http.StatusOK, images)
}

func (dc *DockerController) GetVolumes(c *gin.Context) {
	cmd := exec.Command("docker", "volume", "ls", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var volumes []gin.H

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var raw map[string]interface{}
		if err := json.Unmarshal([]byte(line), &raw); err == nil {
			volumes = append(volumes, gin.H{
				"name":       raw["Name"],
				"driver":     raw["Driver"],
				"mountpoint": raw["Mountpoint"],
				"created":    raw["CreatedAt"],
			})
		}
	}

	c.JSON(http.StatusOK, volumes)
}

func (dc *DockerController) GetNetworks(c *gin.Context) {
	cmd := exec.Command("docker", "network", "ls", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var networks []gin.H

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var raw map[string]interface{}
		if err := json.Unmarshal([]byte(line), &raw); err == nil {
			networks = append(networks, gin.H{
				"id":     raw["ID"],
				"name":   raw["Name"],
				"driver": raw["Driver"],
				"scope":  raw["Scope"],
			})
		}
	}

	c.JSON(http.StatusOK, networks)
}

func (dc *DockerController) ContainerAction(c *gin.Context) {
	id := c.Param("id")
	action := c.Param("action") // start, stop, restart, delete

	var cmd *exec.Cmd
	switch action {
	case "start":
		cmd = exec.Command("docker", "start", id)
	case "stop":
		cmd = exec.Command("docker", "stop", id)
	case "restart":
		cmd = exec.Command("docker", "restart", id)
	case "delete":
		cmd = exec.Command("docker", "rm", "-f", id)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": string(output), "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Container action executed successfully",
		"container": id,
		"action":    action,
		"output":    string(output),
	})
}
