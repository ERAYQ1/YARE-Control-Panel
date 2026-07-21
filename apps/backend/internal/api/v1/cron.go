package v1

import (
	"fmt"
	"net/http"
	"os/exec"
	"runtime"
	"time"

	"yare-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type CronController struct{}

func NewCronController() *CronController {
	return &CronController{}
}

type CronJob struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Schedule   string `json:"schedule"`
	Command    string `json:"command"`
	Enabled    bool   `json:"enabled"`
	LastRun    string `json:"last_run"`
	LastStatus string `json:"last_status"`
	CreatedAt  string `json:"created_at"`
}

func (cc *CronController) GetCronJobs(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, schedule, command, enabled, COALESCE(last_run, ''), last_status, created_at FROM cron_jobs ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cron jobs: " + err.Error()})
		return
	}
	defer rows.Close()

	jobs := []CronJob{}
	for rows.Next() {
		var j CronJob
		var en int
		if err := rows.Scan(&j.ID, &j.Name, &j.Schedule, &j.Command, &en, &j.LastRun, &j.LastStatus, &j.CreatedAt); err == nil {
			j.Enabled = (en == 1)
			jobs = append(jobs, j)
		}
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func (cc *CronController) CreateCronJob(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Schedule string `json:"schedule" binding:"required"`
		Command  string `json:"command" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	id := fmt.Sprintf("cron_%d", time.Now().UnixNano())
	_, err := database.DB.Exec(`INSERT INTO cron_jobs (id, name, schedule, command) VALUES (?, ?, ?, ?)`,
		id, req.Name, req.Schedule, req.Command)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cron job: " + err.Error()})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "CREATE_CRON_JOB", c.ClientIP(), "Created cron job: "+req.Name)

	c.JSON(http.StatusOK, gin.H{"message": "Cron job created successfully", "id": id})
}

func (cc *CronController) DeleteCronJob(c *gin.Context) {
	id := c.Param("id")
	res, err := database.DB.Exec(`DELETE FROM cron_jobs WHERE id = ?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cron job"})
		return
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cron job not found"})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "DELETE_CRON_JOB", c.ClientIP(), "Deleted cron job ID "+id)

	c.JSON(http.StatusOK, gin.H{"message": "Cron job deleted successfully"})
}

func (cc *CronController) ToggleCronJob(c *gin.Context) {
	id := c.Param("id")
	var en int
	err := database.DB.QueryRow(`SELECT enabled FROM cron_jobs WHERE id = ?`, id).Scan(&en)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cron job not found"})
		return
	}

	newEn := 1
	if en == 1 {
		newEn = 0
	}

	_, _ = database.DB.Exec(`UPDATE cron_jobs SET enabled = ? WHERE id = ?`, newEn, id)
	c.JSON(http.StatusOK, gin.H{"message": "Cron status updated", "enabled": (newEn == 1)})
}

func (cc *CronController) RunCronJobNow(c *gin.Context) {
	id := c.Param("id")
	var command string
	err := database.DB.QueryRow(`SELECT command FROM cron_jobs WHERE id = ?`, id).Scan(&command)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cron job not found"})
		return
	}

	// Execute command in background
	go func() {
		var cmd *exec.Cmd
		if runtime.GOOS == "windows" {
			cmd = exec.Command("powershell", "-Command", command)
		} else {
			cmd = exec.Command("bash", "-c", command)
		}

		out, err := cmd.CombinedOutput()
		status := "success"
		if err != nil {
			status = "failed: " + string(out)
		}

		nowStr := time.Now().Format("2006-01-02 15:04:05")
		_, _ = database.DB.Exec(`UPDATE cron_jobs SET last_run = ?, last_status = ? WHERE id = ?`, nowStr, status, id)
	}()

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "RUN_CRON_JOB", c.ClientIP(), "Manually triggered cron job ID "+id)

	c.JSON(http.StatusOK, gin.H{"message": "Cron job execution started in background"})
}
