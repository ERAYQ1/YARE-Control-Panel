package v1

import (
	"net/http"

	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
)

type PluginsController struct{}

func NewPluginsController() *PluginsController {
	return &PluginsController{}
}

func (pc *PluginsController) ListPlugins(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, name, version, description, author, is_enabled FROM plugins")
	if err != nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}
	defer rows.Close()

	var plugins []gin.H
	for rows.Next() {
		var id, name, version, description, author string
		var isEnabled int
		if err := rows.Scan(&id, &name, &version, &description, &author, &isEnabled); err == nil {
			plugins = append(plugins, gin.H{
				"id":          id,
				"name":        name,
				"version":     version,
				"description": description,
				"author":      author,
				"isEnabled":   isEnabled == 1,
			})
		}
	}

	c.JSON(http.StatusOK, plugins)
}

func (pc *PluginsController) TogglePlugin(c *gin.Context) {
	id := c.Param("id")
	var isEnabled int
	err := database.DB.QueryRow("SELECT is_enabled FROM plugins WHERE id = ?", id).Scan(&isEnabled)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plugin not found"})
		return
	}

	newState := 1
	if isEnabled == 1 {
		newState = 0
	}

	_, _ = database.DB.Exec("UPDATE plugins SET is_enabled = ? WHERE id = ?", newState, id)

	c.JSON(http.StatusOK, gin.H{"message": "Plugin state toggled successfully", "id": id, "isEnabled": newState == 1})
}
