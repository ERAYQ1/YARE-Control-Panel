package v1

import (
	"fmt"
	"io"
	"log"
	"os/exec"
	"runtime"
	"sync"

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

	var shellCmd *exec.Cmd
	if runtime.GOOS == "windows" {
		shellCmd = exec.Command("powershell.exe", "-NoExit", "-NoProfile")
	} else {
		shellCmd = exec.Command("/bin/bash")
	}

	stdinPipe, err := shellCmd.StdinPipe()
	if err != nil {
		_ = conn.WriteMessage(websocket.TextMessage, []byte("\r\nUnable to initialize shell stdin pipe\r\n"))
		return
	}

	stdoutPipe, err := shellCmd.StdoutPipe()
	if err != nil {
		_ = conn.WriteMessage(websocket.TextMessage, []byte("\r\nUnable to initialize shell stdout pipe\r\n"))
		return
	}

	stderrPipe, err := shellCmd.StderrPipe()
	if err != nil {
		_ = conn.WriteMessage(websocket.TextMessage, []byte("\r\nUnable to initialize shell stderr pipe\r\n"))
		return
	}

	if err := shellCmd.Start(); err != nil {
		_ = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("\r\nFailed to spawn system shell: %v\r\n", err)))
		return
	}

	welcome := fmt.Sprintf("\r\n\x1b[1;36mYARE Live Interactive Shell Session (%s %s)\x1b[0m\r\nType system commands directly into your terminal.\r\n\r\n", runtime.GOOS, runtime.GOARCH)
	_ = conn.WriteMessage(websocket.TextMessage, []byte(welcome))

	var wsMutex sync.Mutex

	// Read Shell Output and Send to WebSocket
	streamOutput := func(r io.Reader) {
		buf := make([]byte, 1024)
		for {
			n, err := r.Read(buf)
			if n > 0 {
				wsMutex.Lock()
				_ = conn.WriteMessage(websocket.TextMessage, buf[:n])
				wsMutex.Unlock()
			}
			if err != nil {
				break
			}
		}
	}

	go streamOutput(stdoutPipe)
	go streamOutput(stderrPipe)

	// Read Input from WebSocket and Write to Shell Stdin
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		_, _ = stdinPipe.Write(msg)
	}

	if shellCmd.Process != nil {
		_ = shellCmd.Process.Kill()
	}
	_ = shellCmd.Wait()
}
