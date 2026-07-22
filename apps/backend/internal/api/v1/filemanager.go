package v1

import (
	"archive/zip"
	"fmt"
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

func hasHostRoot() bool {
	info, err := os.Stat("/hostroot")
	return err == nil && info.IsDir()
}

func toRealPath(clientPath string) string {
	cleanedInput := filepath.Clean(clientPath)
	if cleanedInput == "." || cleanedInput == "" {
		cleanedInput = "/"
	}

	if !hasHostRoot() {
		if !filepath.IsAbs(cleanedInput) {
			cleanedInput = "/" + strings.TrimLeft(cleanedInput, `/\`)
		}
		return filepath.Clean(cleanedInput)
	}

	relPath := strings.TrimPrefix(cleanedInput, "/hostroot")
	target := filepath.Clean(filepath.Join("/hostroot", relPath))
	if !strings.HasPrefix(target, "/hostroot") {
		return "/hostroot"
	}
	return target
}

func toClientPath(realPath string) string {
	clean := filepath.Clean(realPath)
	if !hasHostRoot() {
		return clean
	}
	if clean == "/hostroot" {
		return "/"
	}
	if strings.HasPrefix(clean, "/hostroot") {
		client := strings.TrimPrefix(clean, "/hostroot")
		if client == "" {
			return "/"
		}
		return client
	}
	return clean
}

func (fm *FileManagerController) ListFiles(c *gin.Context) {
	reqPath := c.DefaultQuery("path", "/")
	realPath := toRealPath(reqPath)
	clientPath := toClientPath(realPath)

	entries, err := os.ReadDir(realPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":       fmt.Sprintf("Unable to access directory '%s': %v", clientPath, err),
			"currentPath": clientPath,
			"items":       []FileItem{},
		})
		return
	}

	var items []FileItem
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}
		entryRealPath := filepath.Join(realPath, entry.Name())
		items = append(items, FileItem{
			Name:        entry.Name(),
			Path:        toClientPath(entryRealPath),
			IsDir:       entry.IsDir(),
			Size:        info.Size(),
			Permissions: info.Mode().String(),
			Mode:        uint32(info.Mode()),
			Owner:       "root",
			Group:       "root",
			ModTime:     info.ModTime().Format("2006-01-02 15:04:05"),
			Extension:   filepath.Ext(entry.Name()),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"currentPath": clientPath,
		"items":       items,
	})
}

func (fm *FileManagerController) ReadFileContent(c *gin.Context) {
	clientPath := c.Query("path")
	if clientPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Path parameter required"})
		return
	}
	realPath := toRealPath(clientPath)

	info, err := os.Stat(realPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("File not found: %v", err)})
		return
	}

	if info.IsDir() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target path is a directory, not a readable file"})
		return
	}

	if info.Size() > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 10MB limit for direct preview"})
		return
	}

	content, err := os.ReadFile(realPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to read file content: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"path": toClientPath(realPath), "content": string(content)})
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

	realPath := toRealPath(req.Path)
	err := os.WriteFile(realPath, []byte(req.Content), 0644)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save file content: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File saved successfully", "path": toClientPath(realPath)})
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

	realPath := toRealPath(req.Path)
	if req.IsDir {
		err := os.MkdirAll(realPath, 0755)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create directory: %v", err)})
			return
		}
	} else {
		parentDir := filepath.Dir(realPath)
		_ = os.MkdirAll(parentDir, 0755)
		err := os.WriteFile(realPath, []byte(""), 0644)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create file: %v", err)})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item created successfully", "path": toClientPath(realPath)})
}

func (fm *FileManagerController) DeleteItem(c *gin.Context) {
	clientPath := c.Query("path")
	if clientPath == "" || clientPath == "/" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete root directory"})
		return
	}

	realPath := toRealPath(clientPath)
	if realPath == "/hostroot" || realPath == "/" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete root directory"})
		return
	}

	err := os.RemoveAll(realPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete item: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully", "path": clientPath})
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

	realPath := toRealPath(req.Path)
	parsedMode, err := strconv.ParseUint(req.Mode, 8, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file permissions octal format (e.g. 755)"})
		return
	}

	err = os.Chmod(realPath, os.FileMode(parsedMode))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update permissions: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permissions updated successfully", "path": toClientPath(realPath)})
}

func (fm *FileManagerController) UploadFile(c *gin.Context) {
	targetDir := c.PostForm("targetDir")
	if targetDir == "" {
		targetDir = "/"
	}
	realTargetDir := toRealPath(targetDir)

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded in form data"})
		return
	}

	destRealPath := filepath.Join(realTargetDir, filepath.Base(file.Filename))
	if err := c.SaveUploadedFile(file, destRealPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save uploaded file: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "path": toClientPath(destRealPath)})
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

	realSource := toRealPath(req.SourcePath)
	realTarget := toRealPath(req.TargetPath)

	zipFile, err := os.Create(realTarget)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create target archive file: %v", err)})
		return
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	err = filepath.Walk(realSource, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return nil
		}
		header.Name = strings.TrimPrefix(path, filepath.Dir(realSource)+string(filepath.Separator))
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

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Compression error: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Archive created successfully", "path": toClientPath(realTarget)})
}
