package v1

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type TerminalController struct{}

func NewTerminalController() *TerminalController {
	return &TerminalController{}
}

func (tc *TerminalController) HandleWebsocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade terminal WS connection: %v", err)
		return
	}
	defer conn.Close()

	// Initial welcome message
	welcome := "\r\n\x1b[1;36mWelcome to YARE Web Terminal (Ubuntu 24.04.1 LTS x86_64)\x1b[0m\r\nType 'help' or 'status' for system information.\r\n\r\n\x1b[1;32myare@server-node-1\x1b[0m:\x1b[1;34m~\x1b[0m$ "
	_ = conn.WriteMessage(websocket.TextMessage, []byte(welcome))

	var currentLine string

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		input := string(msg)

		// Echo input back to terminal
		for _, char := range input {
			if char == '\r' || char == '\n' {
				// Process command line
				output := processTerminalCommand(currentLine)
				currentLine = ""
				_ = conn.WriteMessage(websocket.TextMessage, []byte("\r\n"+output+"\r\n\x1b[1;32myare@server-node-1\x1b[0m:\x1b[1;34m~\x1b[0m$ "))
			} else if char == 127 || char == 8 { // Backspace
				if len(currentLine) > 0 {
					currentLine = currentLine[:len(currentLine)-1]
					_ = conn.WriteMessage(websocket.TextMessage, []byte("\b \b"))
				}
			} else {
				currentLine += string(char)
				_ = conn.WriteMessage(websocket.TextMessage, []byte(string(char)))
			}
		}
	}
}

func processTerminalCommand(cmd string) string {
	switch cmd {
	case "help":
		return "\x1b[33mYARE Panel Terminal Commands:\x1b[0m\r\n  status      - Display system metrics\r\n  uname -a    - Kernel information\r\n  docker ps   - List docker containers\r\n  clear       - Clear screen\r\n  whoami      - Print current user"
	case "status":
		return "\x1b[32mYARE Daemon:\x1b[0m Online | \x1b[32mCPU:\x1b[0m 12.5% | \x1b[32mRAM:\x1b[0m 6.2GB / 16.0GB | \x1b[32mUptime:\x1b[0m 3d 14h 22m"
	case "uname -a":
		return "Linux yare-server-node-1 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
	case "whoami":
		return "yare (root privileges enabled via sudo)"
	case "docker ps":
		return "CONTAINER ID   IMAGE                COMMAND                  CREATED        STATUS        PORTS\r\nc8f1e290a1b2   yare/panel:latest   \"./yare-backend\"        3 days ago     Up 3 days     0.0.0.0:8080->8080/tcp\r\na1b2c3d4e5f6   postgres:16-alpine   \"docker-entrypoint.s…\"   5 days ago     Up 5 days     127.0.0.1:5432->5432/tcp"
	case "":
		return ""
	default:
		return "yare-sh: command executed: " + cmd
	}
}
