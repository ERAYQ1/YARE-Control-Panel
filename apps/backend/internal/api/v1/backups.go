package v1

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"yare-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type BackupsController struct{}

func NewBackupsController() *BackupsController {
	return &BackupsController{}
}

type BackupItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	BackupType  string `json:"backup_type"`
	TargetPath  string `json:"target_path"`
	StorageType string `json:"storage_type"`
	Schedule    string `json:"schedule"`
	LastRun     string `json:"last_run"`
	CreatedAt   string `json:"created_at"`
	SizeBytes   int64  `json:"size_bytes"`
}

func (bc *BackupsController) GetBackups(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, backup_type, target_path, storage_type, schedule, COALESCE(last_run, ''), created_at FROM backups ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch backups: " + err.Error()})
		return
	}
	defer rows.Close()

	backups := []BackupItem{}
	for rows.Next() {
		var b BackupItem
		if err := rows.Scan(&b.ID, &b.Name, &b.BackupType, &b.TargetPath, &b.StorageType, &b.Schedule, &b.LastRun, &b.CreatedAt); err == nil {
			if fi, err := os.Stat(b.TargetPath); err == nil {
				b.SizeBytes = fi.Size()
			}
			backups = append(backups, b)
		}
	}

	c.JSON(http.StatusOK, gin.H{"backups": backups})
}

func (bc *BackupsController) CreateBackup(c *gin.Context) {
	var req struct {
		Name       string `json:"name" binding:"required"`
		BackupType string `json:"backup_type" binding:"required"` // "db", "files", "full"
		SourceDir  string `json:"source_dir"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing backup configuration"})
		return
	}

	backupDir := "/opt/yare/backups"
	_ = os.MkdirAll(backupDir, 0755)

	timestamp := time.Now().Format("20060102_150405")
	backupFileName := fmt.Sprintf("%s_%s_%s.tar.gz", req.Name, req.BackupType, timestamp)
	targetFilePath := filepath.Join(backupDir, backupFileName)

	// Perform compression asynchronously or synchronously
	err := compressDirectoryToTarGz(req.SourceDir, targetFilePath)
	if err != nil && req.SourceDir != "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create archive: " + err.Error()})
		return
	}

	id := fmt.Sprintf("bk_%d", time.Now().UnixNano())
	nowStr := time.Now().Format("2006-01-02 15:04:05")
	_, err = database.DB.Exec(`INSERT INTO backups (id, name, backup_type, target_path, storage_type, schedule, last_run) VALUES (?, ?, ?, ?, 'local', 'manual', ?)`,
		id, req.Name, req.BackupType, targetFilePath, nowStr)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record backup metadata: " + err.Error()})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "CREATE_BACKUP", c.ClientIP(), "Created backup "+backupFileName)

	c.JSON(http.StatusOK, gin.H{"message": "Backup created successfully", "id": id, "path": targetFilePath})
}

func (bc *BackupsController) DownloadBackup(c *gin.Context) {
	id := c.Param("id")
	var targetPath, name string
	err := database.DB.QueryRow(`SELECT target_path, name FROM backups WHERE id = ?`, id).Scan(&targetPath, &name)
	if err != nil || targetPath == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Backup file not found"})
		return
	}

	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Backup file does not exist on disk"})
		return
	}

	c.FileAttachment(targetPath, filepath.Base(targetPath))
}

func (bc *BackupsController) DeleteBackup(c *gin.Context) {
	id := c.Param("id")
	var targetPath string
	_ = database.DB.QueryRow(`SELECT target_path FROM backups WHERE id = ?`, id).Scan(&targetPath)

	if targetPath != "" {
		_ = os.Remove(targetPath)
	}

	_, _ = database.DB.Exec(`DELETE FROM backups WHERE id = ?`, id)

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprintf("%v", username), "DELETE_BACKUP", c.ClientIP(), "Deleted backup ID "+id)

	c.JSON(http.StatusOK, gin.H{"message": "Backup deleted successfully"})
}

func compressDirectoryToTarGz(srcDir, tarGzPath string) error {
	if srcDir == "" {
		srcDir = "/opt/yare"
	}

	out, err := os.Create(tarGzPath)
	if err != nil {
		return err
	}
	defer out.Close()

	gw := gzip.NewWriter(out)
	defer gw.Close()

	tw := tar.NewWriter(gw)
	defer tw.Close()

	return filepath.Walk(srcDir, func(file string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		header, err := tar.FileInfoHeader(fi, fi.Name())
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(srcDir, file)
		if err != nil {
			return err
		}
		header.Name = filepath.ToSlash(relPath)

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if !fi.Mode().IsRegular() {
			return nil
		}

		f, err := os.Open(file)
		if err != nil {
			return err
		}
		defer f.Close()

		_, err = io.Copy(tw, f)
		return err
	})
}
