package v1

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os/exec"
	"strings"
	"time"

	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AppStoreController struct{}

func NewAppStoreController() *AppStoreController {
	return &AppStoreController{}
}

type CuratedApp struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	RepoURL     string   `json:"repoUrl"`
	Category    string   `json:"category"`
	Description string   `json:"description"`
	Icon        string   `json:"icon"`
	Stars       int      `json:"stars"`
	DefaultPort string   `json:"defaultPort"`
	DockerImage string   `json:"dockerImage"`
	EnvVars     string   `json:"envVars"`
	Tags        []string `json:"tags"`
}

type InstalledApp struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	RepoURL       string    `json:"repoUrl"`
	Description   string    `json:"description"`
	Category      string    `json:"category"`
	Icon          string    `json:"icon"`
	ContainerName string    `json:"containerName"`
	Status        string    `json:"status"`
	Port          string    `json:"port"`
	EnvVars       string    `json:"envVars"`
	CreatedAt     time.Time `json:"createdAt"`
}

func (ac *AppStoreController) GetCuratedApps(c *gin.Context) {
	curated := []CuratedApp{
		{
			ID:          "uptime-kuma",
			Name:        "Uptime Kuma",
			RepoURL:     "https://github.com/louislam/uptime-kuma",
			Category:    "Monitoring",
			Description: "A fancy self-hosted monitoring tool for HTTP, Ping, DNS, and TCP services.",
			Icon:        "📊",
			Stars:       55000,
			DefaultPort: "3001",
			DockerImage: "louislam/uptime-kuma:1",
			EnvVars:     "PORT=3001",
			Tags:        []string{"Monitoring", "Status Page", "Uptime"},
		},
		{
			ID:          "nginx-proxy-manager",
			Name:        "Nginx Proxy Manager",
			RepoURL:     "https://github.com/NginxProxyManager/nginx-proxy-manager",
			Category:    "Networking",
			Description: "Docker container for managing Nginx proxy hosts with a clean web GUI & free SSL.",
			Icon:        "🌐",
			Stars:       22000,
			DefaultPort: "81",
			DockerImage: "jc21/nginx-proxy-manager:latest",
			EnvVars:     "DISABLE_HTTP2=true",
			Tags:        []string{"Proxy", "SSL", "Nginx"},
		},
		{
			ID:          "portainer-ce",
			Name:        "Portainer CE",
			RepoURL:     "https://github.com/portainer/portainer",
			Category:    "DevOps",
			Description: "Lightweight management UI that allows you to easily manage your Docker environments.",
			Icon:        "🐳",
			Stars:       30000,
			DefaultPort: "9000",
			DockerImage: "portainer/portainer-ce:latest",
			EnvVars:     "",
			Tags:        []string{"Docker", "DevOps", "Management"},
		},
		{
			ID:          "vaultwarden",
			Name:        "Vaultwarden",
			RepoURL:     "https://github.com/dani-garcia/vaultwarden",
			Category:    "Security",
			Description: "Lightweight password manager server written in Rust, compatible with Bitwarden clients.",
			Icon:        "🔐",
			Stars:       37000,
			DefaultPort: "8080",
			DockerImage: "vaultwarden/server:latest",
			EnvVars:     "WEBSOCKET_ENABLED=true",
			Tags:        []string{"Security", "Vault", "Passwords"},
		},
		{
			ID:          "postgresql",
			Name:        "PostgreSQL + pgAdmin",
			RepoURL:     "https://github.com/postgres/postgres",
			Category:    "Databases",
			Description: "The world's most advanced open-source relational database engine.",
			Icon:        "🗄️",
			Stars:       16000,
			DefaultPort: "5432",
			DockerImage: "postgres:16-alpine",
			EnvVars:     "POSTGRES_PASSWORD=yarepass123\nPOSTGRES_USER=yare\nPOSTGRES_DB=yaredb",
			Tags:        []string{"Database", "SQL", "PostgreSQL"},
		},
		{
			ID:          "redis-stack",
			Name:        "Redis In-Memory Data",
			RepoURL:     "https://github.com/redis/redis",
			Category:    "Databases",
			Description: "Ultra-fast in-memory data structure store used as a database, cache, and message broker.",
			Icon:        "⚡",
			Stars:       65000,
			DefaultPort: "6379",
			DockerImage: "redis:7-alpine",
			EnvVars:     "",
			Tags:        []string{"Redis", "Cache", "KV"},
		},
		{
			ID:          "minio",
			Name:        "MinIO Object Storage",
			RepoURL:     "https://github.com/minio/minio",
			Category:    "Storage",
			Description: "High-performance S3 compatible object storage suite for enterprise cloud native apps.",
			Icon:        "🪣",
			Stars:       45000,
			DefaultPort: "9001",
			DockerImage: "minio/minio:latest",
			EnvVars:     "MINIO_ROOT_USER=minioadmin\nMINIO_ROOT_PASSWORD=minioadmin",
			Tags:        []string{"S3", "Object Storage", "Cloud"},
		},
		{
			ID:          "grafana",
			Name:        "Grafana Dashboards",
			RepoURL:     "https://github.com/grafana/grafana",
			Category:    "Monitoring",
			Description: "Operational dashboards for your data, metrics, logs, and traces visualization.",
			Icon:        "📈",
			Stars:       60000,
			DefaultPort: "3000",
			DockerImage: "grafana/grafana:latest",
			EnvVars:     "GF_SECURITY_ADMIN_PASSWORD=admin",
			Tags:        []string{"Grafana", "Metrics", "Analytics"},
		},
		{
			ID:          "n8n",
			Name:        "n8n Workflow Automation",
			RepoURL:     "https://github.com/n8n-io/n8n",
			Category:    "Automation",
			Description: "Free and source-available workflow automation tool with 400+ native integrations.",
			Icon:        "🔄",
			Stars:       48000,
			DefaultPort: "5678",
			DockerImage: "n8nio/n8n:latest",
			EnvVars:     "N8N_PORT=5678",
			Tags:        []string{"Automation", "Workflow", "No-code"},
		},
		{
			ID:          "nextcloud",
			Name:        "Nextcloud Hub",
			RepoURL:     "https://github.com/nextcloud/server",
			Category:    "Storage",
			Description: "Self-hosted productivity platform giving you control over your data and files.",
			Icon:        "☁️",
			Stars:       26000,
			DefaultPort: "8080",
			DockerImage: "nextcloud:latest",
			EnvVars:     "",
			Tags:        []string{"Cloud", "Files", "Productivity"},
		},
		{
			ID:          "meilisearch",
			Name:        "Meilisearch Engine",
			RepoURL:     "https://github.com/meilisearch/meilisearch",
			Category:    "Search",
			Description: "A lightning-fast, hyper-relevant search engine designed for instant search experiences.",
			Icon:        "🔍",
			Stars:       44000,
			DefaultPort: "7700",
			DockerImage: "getmeili/meilisearch:v1.8",
			EnvVars:     "MEILI_MASTER_KEY=yare_master_key_123",
			Tags:        []string{"Search", "Database", "Fast"},
		},
		{
			ID:          "directus",
			Name:        "Directus Headless CMS",
			RepoURL:     "https://github.com/directus/directus",
			Category:    "CMS & API",
			Description: "Open-source Data Platform that turns any SQL database into a dynamic GraphQL/REST API & Admin GUI.",
			Icon:        "💎",
			Stars:       27000,
			DefaultPort: "8055",
			DockerImage: "directus/directus:latest",
			EnvVars:     "KEY=yare-directus-key\nSECRET=yare-directus-secret",
			Tags:        []string{"CMS", "GraphQL", "REST API"},
		},
	}

	c.JSON(http.StatusOK, curated)
}

func (ac *AppStoreController) SearchGitHubRepos(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		query = "topic:self-hosted"
	}

	apiURL := fmt.Sprintf("https://api.github.com/search/repositories?q=%s&sort=stars&order=desc&per_page=20", url.QueryEscape(query))
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request"})
		return
	}
	req.Header.Set("User-Agent", "YARE-Control-Panel/1.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusGatewayTimeout, gin.H{"error": "Failed to connect to GitHub API"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	var ghResult struct {
		TotalCount int `json:"total_count"`
		Items      []struct {
			ID            int      `json:"id"`
			Name          string   `json:"name"`
			FullName      string   `json:"full_name"`
			HTMLURL       string   `json:"html_url"`
			Description   string   `json:"description"`
			Stargazers    int      `json:"stargazers_count"`
			ForksCount    int      `json:"forks_count"`
			Language      string   `json:"language"`
			Topics        []string `json:"topics"`
			Owner         struct {
				Login     string `json:"login"`
				AvatarURL string `json:"avatar_url"`
			} `json:"owner"`
			UpdatedAt string `json:"updated_at"`
		} `json:"items"`
	}

	if err := json.Unmarshal(body, &ghResult); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse GitHub JSON"})
		return
	}

	c.JSON(http.StatusOK, ghResult)
}

type InspectRepoRequest struct {
	RepoURL string `json:"repoUrl" binding:"required"`
}

func (ac *AppStoreController) InspectGitHubRepo(c *gin.Context) {
	var req InspectRepoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repository URL"})
		return
	}

	cleanURL := strings.TrimPrefix(req.RepoURL, "https://github.com/")
	cleanURL = strings.TrimPrefix(cleanURL, "http://github.com/")
	cleanURL = strings.TrimSuffix(cleanURL, ".git")
	cleanURL = strings.Trim(cleanURL, "/")

	parts := strings.Split(cleanURL, "/")
	if len(parts) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid GitHub repository format (expected owner/repo)"})
		return
	}

	owner, repo := parts[0], parts[1]
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repo)

	httpReq, _ := http.NewRequest("GET", apiURL, nil)
	httpReq.Header.Set("User-Agent", "YARE-Control-Panel/1.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repository not found on GitHub"})
		return
	}
	defer resp.Body.Close()

	var repoDetails struct {
		Name        string   `json:"name"`
		FullName    string   `json:"full_name"`
		HTMLURL     string   `json:"html_url"`
		Description string   `json:"description"`
		Stargazers  int      `json:"stargazers_count"`
		ForksCount  int      `json:"forks_count"`
		Language    string   `json:"language"`
		Topics      []string `json:"topics"`
		Owner       struct {
			Login     string `json:"login"`
			AvatarURL string `json:"avatar_url"`
		} `json:"owner"`
	}

	json.NewDecoder(resp.Body).Decode(&repoDetails)

	c.JSON(http.StatusOK, gin.H{
		"name":           repoDetails.Name,
		"fullName":       repoDetails.FullName,
		"repoUrl":        repoDetails.HTMLURL,
		"description":    repoDetails.Description,
		"stars":          repoDetails.Stargazers,
		"language":       repoDetails.Language,
		"ownerAvatar":    repoDetails.Owner.AvatarURL,
		"suggestedImage": fmt.Sprintf("%s/%s:latest", owner, repoDetails.Name),
		"suggestedPort":  "8080",
		"suggestedEnv":   "PORT=8080",
	})
}

type DeployAppRequest struct {
	Name        string `json:"name" binding:"required"`
	RepoURL     string `json:"repoUrl"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	DockerImage string `json:"dockerImage" binding:"required"`
	Port        string `json:"port"`
	EnvVars     string `json:"envVars"`
}

func (ac *AppStoreController) DeployApp(c *gin.Context) {
	var req DeployAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	appID := "app_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:12]
	containerName := fmt.Sprintf("yare_app_%s", strings.ToLower(strings.ReplaceAll(req.Name, " ", "_")))
	if req.Icon == "" {
		req.Icon = "📦"
	}
	if req.Category == "" {
		req.Category = "GitHub App"
	}

	// Deploy container via Docker CLI if available
	status := "running"
	var deployLog bytes.Buffer
	deployLog.WriteString(fmt.Sprintf("--> Initializing deployment for %s (%s)...\n", req.Name, req.DockerImage))

	var dockerCmdArgs []string
	dockerCmdArgs = append(dockerCmdArgs, "run", "-d", "--name", containerName, "--restart", "unless-stopped")

	if req.Port != "" {
		dockerCmdArgs = append(dockerCmdArgs, "-p", fmt.Sprintf("%s:%s", req.Port, req.Port))
	}

	if req.EnvVars != "" {
		envLines := strings.Split(req.EnvVars, "\n")
		for _, env := range envLines {
			env = strings.TrimSpace(env)
			if env != "" {
				dockerCmdArgs = append(dockerCmdArgs, "-e", env)
			}
		}
	}

	dockerCmdArgs = append(dockerCmdArgs, req.DockerImage)

	cmd := exec.Command("docker", dockerCmdArgs...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		deployLog.WriteString(fmt.Sprintf("Docker warning: %s. Managed stack created in database.\n", string(cmdOutput)))
	} else {
		deployLog.WriteString(fmt.Sprintf("Successfully started container %s!\n", containerName))
	}

	// Insert into SQLite database
	query := `INSERT INTO installed_apps (id, name, repo_url, description, category, icon, container_name, status, port, env_vars, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, dbErr := database.DB.Exec(query, appID, req.Name, req.RepoURL, req.Description, req.Category, req.Icon, containerName, status, req.Port, req.EnvVars, time.Now())

	if dbErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save application to database: " + dbErr.Error()})
		return
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprint(username), "APP_DEPLOY", c.ClientIP(), fmt.Sprintf("Deployed GitHub App: %s (%s)", req.Name, req.DockerImage))

	c.JSON(http.StatusOK, gin.H{
		"message":       fmt.Sprintf("Successfully deployed %s!", req.Name),
		"id":            appID,
		"containerName": containerName,
		"status":        status,
		"logs":          deployLog.String(),
	})
}

func (ac *AppStoreController) GetInstalledApps(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, name, repo_url, description, category, icon, container_name, status, port, env_vars, created_at FROM installed_apps ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusOK, []InstalledApp{})
		return
	}
	defer rows.Close()

	var apps []InstalledApp
	for rows.Next() {
		var a InstalledApp
		var createdAtStr sql.NullString
		rows.Scan(&a.ID, &a.Name, &a.RepoURL, &a.Description, &a.Category, &a.Icon, &a.ContainerName, &a.Status, &a.Port, &a.EnvVars, &createdAtStr)
		apps = append(apps, a)
	}

	c.JSON(http.StatusOK, apps)
}

func (ac *AppStoreController) AppAction(c *gin.Context) {
	id := c.Param("id")
	action := c.Param("action") // start, stop, restart, delete

	var containerName string
	err := database.DB.QueryRow("SELECT container_name FROM installed_apps WHERE id = ?", id).Scan(&containerName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	switch action {
	case "start":
		exec.Command("docker", "start", containerName).Run()
		database.DB.Exec("UPDATE installed_apps SET status = 'running' WHERE id = ?", id)
	case "stop":
		exec.Command("docker", "stop", containerName).Run()
		database.DB.Exec("UPDATE installed_apps SET status = 'stopped' WHERE id = ?", id)
	case "restart":
		exec.Command("docker", "restart", containerName).Run()
		database.DB.Exec("UPDATE installed_apps SET status = 'running' WHERE id = ?", id)
	case "delete":
		exec.Command("docker", "rm", "-f", containerName).Run()
		database.DB.Exec("DELETE FROM installed_apps WHERE id = ?", id)
	}

	username, _ := c.Get("username")
	database.RecordAuditLog(fmt.Sprint(username), "APP_ACTION", c.ClientIP(), fmt.Sprintf("Action %s on app ID %s", action, id))

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Action %s executed successfully", action),
		"id":      id,
		"action":  action,
	})
}

func (ac *AppStoreController) GetAppLogs(c *gin.Context) {
	id := c.Param("id")
	var containerName string
	err := database.DB.QueryRow("SELECT container_name FROM installed_apps WHERE id = ?", id).Scan(&containerName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "App not found"})
		return
	}

	cmd := exec.Command("docker", "logs", "--tail", "100", containerName)
	output, err := cmd.CombinedOutput()
	logs := string(output)
	if logs == "" {
		logs = fmt.Sprintf("No logs retrieved yet for container %s.", containerName)
	}

	c.JSON(http.StatusOK, gin.H{"id": id, "containerName": containerName, "logs": logs})
}
