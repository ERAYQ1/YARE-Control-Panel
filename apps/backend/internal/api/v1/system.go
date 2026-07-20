package v1

import (
	"net/http"
	"os"
	"runtime"

	"github.com/gin-gonic/gin"
)

type SystemController struct{}

func NewSystemController() *SystemController {
	return &SystemController{}
}

func (sc *SystemController) GetSystemDetails(c *gin.Context) {
	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "yare-node-ubuntu-24"
	}

	info := gin.H{
		"hostname":      hostname,
		"timezone":      "UTC (+03:00 Europe/Istanbul)",
		"kernelVersion": "6.8.0-40-generic",
		"osVersion":     "Ubuntu 24.04.1 LTS (Noble Numbat)",
		"cpuModel":      "AMD EPYC 7763 64-Core Processor",
		"cpuCores":      8,
		"cpuThreads":    16,
		"ramTotal":      32 * 1024 * 1024 * 1024,
		"swapTotal":     4 * 1024 * 1024 * 1024,
		"architecture":  runtime.GOARCH,
		"disks": []gin.H{
			{"name": "/dev/nvme0n1", "size": 512 * 1024 * 1024 * 1024, "type": "NVMe SSD", "model": "Samsung SSD 980 PRO 512GB"},
			{"name": "/dev/sda", "size": 2000 * 1024 * 1024 * 1024, "type": "SATA HDD", "model": "WDC WD2003FZEX-00SRLA0"},
		},
		"partitions": []gin.H{
			{"device": "/dev/nvme0n1p1", "mountPoint": "/boot/efi", "fsType": "vfat", "size": 512 * 1024 * 1024},
			{"device": "/dev/nvme0n1p2", "mountPoint": "/", "fsType": "ext4", "size": 511 * 1024 * 1024 * 1024},
		},
		"pciDevices": []string{
			"00:00.0 Host bridge: Advanced Micro Devices, Inc. [AMD] Starship/Matisse Root Complex",
			"01:00.0 VGA compatible controller: NVIDIA Corporation GA106 [GeForce RTX 3060]",
			"02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I225-V (rev 03)",
		},
		"usbDevices": []string{
			"Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub",
			"Bus 002 Device 002: ID 0781:5581 SanDisk Corp. Ultra",
		},
		"gpu":         "NVIDIA GeForce RTX 3060 12GB",
		"bios":        "American Megatrends Inc. v2.40 (11/14/2025)",
		"motherboard": "ASUSTeK COMPUTER INC. ROG STRIX B550-F GAMING",
	}

	c.JSON(http.StatusOK, info)
}
