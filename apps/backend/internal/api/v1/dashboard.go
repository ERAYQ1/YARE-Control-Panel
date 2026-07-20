package v1

import (
	"log"
	"net/http"
	"time"

	"yare-backend/internal/system"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type DashboardController struct{}

func NewDashboardController() *DashboardController {
	return &DashboardController{}
}

func (dc *DashboardController) GetStats(c *gin.Context) {
	metrics := system.CollectMetrics()
	c.JSON(http.StatusOK, metrics)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (dc *DashboardController) StreamMetricsWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket connection: %v", err)
		return
	}
	defer conn.Close()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			metrics := system.CollectMetrics()
			if err := conn.WriteJSON(metrics); err != nil {
				return
			}
		}
	}
}
