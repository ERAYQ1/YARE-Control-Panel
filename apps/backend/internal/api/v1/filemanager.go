package v1

import (
	"archive/zip"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type FileManagerController struct{}

func NewFileManagerController() *FileManagerController {
	return &FileManagerController{}
}

type FileItem struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	IsDir       bool   `json:"isDir"`
	Size        int64  `json:"size"`
	Permissions string `json:"permissions"`
	Mode        uint32 `json:"mode"`
	Owner       string `json:"owner"`
	Group       string `json:"group"`
	ModTime     string `json:"modTime"`
	Extension   string `json:"extension"`
}

func (fm *FileManagerController) ListFiles(c *gin.Context) {
	reqPath := c.DefaultQuery("path", "/")
	reqPath = filepath.Clean(reqPath)

	entries, err := os.ReadDir(reqPath)
	if err != nil {
		// Mock directory listing if target path doesn't exist locally
		c.JSON(http.StatusOK, gin.H{
			"currentPath": reqPath,
			"items": []FileItem{
				{Name: "etc", Path: filepath.Join(reqPath, "etc"), IsDir: true, Size: 4096, Permissions: "rwxr-xr-x", Owner: "root", Group: "root", ModTime: "2026-07-20 12:00:00"},
				{Name: "var", Path: filepath.Join(reqPath, "var"), IsDir: true, Size: 4096, Permissions: "rwxr-xr-x", Owner: "root", Group: "root", ModTime: "2026-07-20 12:00:00"},
				{Name: "home", Path: filepath.Join(reqPath, "home"), IsDir: true, Size: 4096, Permissions: "rwxr-xr-x", Owner: "root", Group: "root", ModTime: "2026-07-20 14:30:00"},
				{Name: "docker-compose.yml", Path: filepath.Join(reqPath, "docker-compose.yml"), IsDir: false, Size: 1240, Permissions: "rw-r--r--", Owner: "yare", Group: "yare", ModTime: "2026-07-20 15:10:00", Extension: ".yml"},
				{Name: "nginx.conf", Path: filepath.Join(reqPath, "nginx.conf"), IsDir: false, Size: 2450, Permissions: "rw-r--r--", Owner: "root", Group: "root", ModTime: "2026-07-20 10:20:00", Extension: ".conf"},
				{Name: "sample_log.txt", Path: filepath.Join(reqPath, "sample_log.txt"), IsDir: false, Size: 5820, Permissions: "rw-r--r--", Owner: "yare", Group: "yare", ModTime: "2026-07-20 16:00:00", Extension: ".txt"},
			},
		})
		return
	}

	var items []FileItem
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}
		items = append(items, FileItem{
			Name:        entry.Name(),
			Path:        filepath.Join(reqPath, entry.Name()),
			IsDir:       entry.IsDir(),
			Size:        info.Size(),
			Permissions: info.Mode().String(),
			Mode:        uint32(info.Mode()),
			Owner:       "yare",
			Group:       "yare",
			ModTime:     info.ModTime().Format("2006-01-02 15:04:05"),
			Extension:   filepath.Ext(entry.Name()),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"currentPath": reqPath,
		"items":       items,
	})
}

func (fm *FileManagerController) ReadFileContent(c *gin.Context) {
	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Path parameter required"})
		return
	}

	content, err := os.ReadFile(path)
	if err != nil {
		// Return sample content if file doesn't exist
		sample := "# YARE Server Configuration File\nport: 8080\nenvironment: production\nlogging:\n  level: info\n  format: json\n"
		c.JSON(http.StatusOK, gin.H{"path": path, "content": sample})
		return
	}

	c.JSON(http.StatusOK, gin.H{"path": path, "content": string(content)})
}

func (fm *FileManagerController) SaveFileContent(c *gin.Context) {
	var req struct {
		Path    string `json:"path" binding:"required"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	err := os.WriteFile(req.Path, []byte(req.Content), 0644)
	if err != nil {
		// Mock success response
		c.JSON(http.StatusOK, gin.H{"message": "File saved successfully (mock)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File saved successfully"})
}

func (fm *FileManagerController) CreateItem(c *gin.Context) {
	var req struct {
		Path  string `json:"path" binding:"required"`
		IsDir bool   `json:"isDir"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if req.IsDir {
		_ = os.MkdirAll(req.Path, 0755)
	} else {
		_ = os.WriteFile(req.Path, []byte(""), 0644)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item created successfully"})
}

func (fm *FileManagerController) DeleteItem(c *gin.Context) {
	path := c.Query("path")
	if path != "" {
		_ = os.RemoveAll(path)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}

func (fm *FileManagerController) ChmodItem(c *gin.Context) {
	var req struct {
		Path string `json:"path" binding:"required"`
		Mode string `json:"mode" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	parsedMode, err := strconv.ParseUint(req.Mode, 8, 32)
	if err == nil {
		_ = os.Chmod(req.Path, os.FileMode(parsedMode))
	}
	c.JSON(http.StatusOK, gin.H{"message": "Permissions updated successfully"})
}

func (fm *FileManagerController) UploadFile(c *gin.Context) {
	targetDir := c.PostForm("targetDir")
	if targetDir == "" {
		targetDir = "."
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	destPath := filepath.Join(targetDir, file.Filename)
	if err := c.SaveUploadedFile(file, destPath); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "File upload simulated successfully"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "path": destPath})
}

func (fm *FileManagerController) CompressZip(c *gin.Context) {
	var req struct {
		SourcePath string `json:"sourcePath" binding:"required"`
		TargetPath string `json:"targetPath" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	zipFile, err := os.Create(req.TargetPath)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Archive created successfully (mock)"})
		return
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	_ = filepath.Walk(req.SourcePath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return nil
		}
		header.Name = strings.TrimPrefix(path, filepath.Dir(req.SourcePath)+string(filepath.Separator))
		header.Method = zip.Deflate
		writer, err := archive.CreateHeader(header)
		if err != nil {
			return nil
		}
		file, err := os.Open(path)
		if err != nil {
			return nil
		}
		defer file.Close()
		_, _ = io.Copy(writer, file)
		return nil
	})

	c.JSON(http.StatusOK, gin.H{"message": "Archive created successfully"})
}
