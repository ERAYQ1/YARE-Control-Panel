package cronworker

import (
	"log"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"yare-backend/internal/database"
)

// StartCronScheduler initializes a background ticker that inspects and executes scheduled cron jobs
func StartCronScheduler() {
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		log.Println("[CRON WORKER] Background Cron Job Scheduler initialized.")

		for range ticker.C {
			checkAndRunCronJobs()
		}
	}()
}

func checkAndRunCronJobs() {
	if database.DB == nil {
		return
	}

	rows, err := database.DB.Query(`SELECT id, name, schedule, command FROM cron_jobs WHERE enabled = 1`)
	if err != nil {
		return
	}
	defer rows.Close()

	now := time.Now()

	for rows.Next() {
		var id, name, schedule, command string
		if err := rows.Scan(&id, &name, &schedule, &command); err != nil {
			continue
		}

		if shouldRunNow(schedule, now) {
			jobID := id
			jobCmd := command
			jobName := name
			go executeJob(jobID, jobName, jobCmd, now)
		}
	}
}

func shouldRunNow(schedule string, now time.Time) bool {
	schedule = strings.TrimSpace(schedule)
	if schedule == "" {
		return false
	}

	// Preset keywords
	switch schedule {
	case "* * * * *", "@every_minute":
		return true
	case "@hourly", "0 * * * *":
		return now.Minute() == 0
	case "@daily", "0 0 * * *":
		return now.Hour() == 0 && now.Minute() == 0
	case "@weekly", "0 0 * * 0":
		return now.Weekday() == time.Sunday && now.Hour() == 0 && now.Minute() == 0
	}

	// Simple step syntax (e.g., */5 * * * *)
	if strings.HasPrefix(schedule, "*/") {
		parts := strings.Fields(schedule)
		if len(parts) > 0 {
			stepStr := strings.TrimPrefix(parts[0], "*/")
			if step, err := strconv.Atoi(stepStr); err == nil && step > 0 {
				return now.Minute()%step == 0
			}
		}
	}

	return false
}

func executeJob(id, name, command string, runTime time.Time) {
	log.Printf("[CRON WORKER] Executing scheduled job: %s (%s)", name, id)
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("powershell", "-NoProfile", "-Command", command)
	} else {
		cmd = exec.Command("bash", "-c", command)
	}

	out, err := cmd.CombinedOutput()
	status := "success"
	if err != nil {
		status = "failed: " + strings.TrimSpace(string(out))
		if len(status) > 200 {
			status = status[:200]
		}
	}

	nowStr := runTime.Format("2006-01-02 15:04:05")
	_, _ = database.DB.Exec(`UPDATE cron_jobs SET last_run = ?, last_status = ? WHERE id = ?`, nowStr, status, id)
}
