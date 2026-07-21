package v1

import (
	"fmt"
	"net/http"
	"os"
	"runtime"
	"time"

	"yare-backend/internal/system"
	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemController struct{}

func NewSystemController() *SystemController {
	return &SystemController{}
}

func (sc *SystemController) GetSystemDetails(c *gin.Context) {
	metrics := system.CollectMetrics()

	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = metrics.Hostname
	}

	hostInfo, _ := host.Info()
	osVersion := runtime.GOOS
	kernelVersion := "N/A"
	if hostInfo != nil {
		if hostInfo.Platform != "" {
			osVersion = fmt.Sprintf("%s %s", hostInfo.Platform, hostInfo.PlatformVersion)
		}
		kernelVersion = hostInfo.KernelVersion
	}

	cpuInfo, _ := cpu.Info()
	cpuModel := "Unknown Processor"
	if len(cpuInfo) > 0 && cpuInfo[0].ModelName != "" {
		cpuModel = cpuInfo[0].ModelName
	}

	vMem, _ := mem.VirtualMemory()
	swapMem, _ := mem.SwapMemory()

	var ramTotal uint64
	if vMem != nil {
		ramTotal = vMem.Total
	}

	var swapTotal uint64
	if swapMem != nil {
		swapTotal = swapMem.Total
	}

	zoneName, offset := time.Now().Zone()
	timezone := fmt.Sprintf("%s (UTC%+d)", zoneName, offset/3600)

	var diskPartitions []gin.H
	for _, drive := range metrics.Disk.Drives {
		diskPartitions = append(diskPartitions, gin.H{
			"device":     drive.Device,
			"mountPoint": drive.MountPoint,
			"fsType":     drive.FSType,
			"size":       drive.Total,
			"used":       drive.Used,
			"free":       drive.Free,
			"percent":    drive.UsagePercent,
		})
	}

	info := gin.H{
		"hostname":      hostname,
		"timezone":      timezone,
		"kernelVersion": kernelVersion,
		"osVersion":     osVersion,
		"cpuModel":      cpuModel,
		"cpuCores":      runtime.NumCPU(),
		"cpuThreads":    runtime.NumCPU(),
		"ramTotal":      ramTotal,
		"swapTotal":     swapTotal,
		"architecture":  runtime.GOARCH,
		"uptime":        metrics.Uptime,
		"disks": []gin.H{
			{"name": "Primary Storage", "size": metrics.Disk.Total, "type": "Host Storage", "used": metrics.Disk.Used},
		},
		"partitions": diskPartitions,
	}

	c.JSON(http.StatusOK, info)
}
