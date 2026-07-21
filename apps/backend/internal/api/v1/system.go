package v1

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"yare-backend/internal/system"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemController struct{}

func NewSystemController() *SystemController {
	return &SystemController{}
}

func getDMIValue(filename string) string {
	paths := []string{
		"/host/sys/class/dmi/id/" + filename,
		"/sys/class/dmi/id/" + filename,
	}
	for _, p := range paths {
		if data, err := os.ReadFile(p); err == nil {
			val := strings.TrimSpace(string(data))
			if val != "" && val != "To be filled by O.E.M." && val != "Default string" {
				return val
			}
		}
	}
	return ""
}

func getMotherboardInfo() string {
	board := getDMIValue("board_name")
	vendor := getDMIValue("board_vendor")
	if board != "" && vendor != "" {
		return fmt.Sprintf("%s (%s)", board, vendor)
	}
	if board != "" {
		return board
	}
	product := getDMIValue("product_name")
	if product != "" {
		return product
	}
	return "Standard Mainboard"
}

func getBIOSInfo() string {
	vendor := getDMIValue("bios_vendor")
	version := getDMIValue("bios_version")
	if vendor != "" && version != "" {
		return fmt.Sprintf("%s v%s", vendor, version)
	}
	if version != "" {
		return "BIOS " + version
	}
	return "UEFI System Firmware"
}

func getPCIDevices() []string {
	var devices []string
	cmd := exec.Command("lspci")
	if out, err := cmd.Output(); err == nil {
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		for _, l := range lines {
			if strings.TrimSpace(l) != "" {
				devices = append(devices, strings.TrimSpace(l))
			}
		}
		if len(devices) > 0 {
			return devices
		}
	}

	pciDirs := []string{"/host/sys/bus/pci/devices", "/sys/bus/pci/devices"}
	for _, pciPath := range pciDirs {
		entries, err := os.ReadDir(pciPath)
		if err == nil && len(entries) > 0 {
			for _, entry := range entries {
				ueventPath := filepath.Join(pciPath, entry.Name(), "uevent")
				if data, err := os.ReadFile(ueventPath); err == nil {
					lines := strings.Split(string(data), "\n")
					var pciClass, pciID string
					for _, line := range lines {
						if strings.HasPrefix(line, "PCI_CLASS=") {
							pciClass = strings.TrimPrefix(line, "PCI_CLASS=")
						} else if strings.HasPrefix(line, "PCI_ID=") {
							pciID = strings.TrimPrefix(line, "PCI_ID=")
						}
					}
					if pciID != "" {
						devices = append(devices, fmt.Sprintf("%s PCI Device [%s] Class: %s", entry.Name(), pciID, pciClass))
					}
				}
			}
			if len(devices) > 0 {
				return devices
			}
		}
	}
	return []string{"Host PCI Controller Bus OK"}
}

func getUSBDevices() []string {
	var devices []string
	cmd := exec.Command("lsusb")
	if out, err := cmd.Output(); err == nil {
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		for _, l := range lines {
			if strings.TrimSpace(l) != "" {
				devices = append(devices, strings.TrimSpace(l))
			}
		}
		if len(devices) > 0 {
			return devices
		}
	}

	usbDirs := []string{"/host/sys/bus/usb/devices", "/sys/bus/usb/devices"}
	for _, usbPath := range usbDirs {
		entries, err := os.ReadDir(usbPath)
		if err == nil && len(entries) > 0 {
			for _, entry := range entries {
				manuFile := filepath.Join(usbPath, entry.Name(), "manufacturer")
				prodFile := filepath.Join(usbPath, entry.Name(), "product")
				mBytes, _ := os.ReadFile(manuFile)
				pBytes, _ := os.ReadFile(prodFile)
				manu := strings.TrimSpace(string(mBytes))
				prod := strings.TrimSpace(string(pBytes))
				if manu != "" || prod != "" {
					devices = append(devices, fmt.Sprintf("USB Device %s: %s %s", entry.Name(), manu, prod))
				}
			}
			if len(devices) > 0 {
				return devices
			}
		}
	}
	return []string{"USB Host Controller Bus OK"}
}

func getGPUInfo(pciDevs []string) string {
	for _, dev := range pciDevs {
		devLower := strings.ToLower(dev)
		if strings.Contains(devLower, "vga") || strings.Contains(devLower, "3d") || strings.Contains(devLower, "display") {
			return dev
		}
	}
	return "Integrated Graphics Controller"
}

func (sc *SystemController) GetSystemDetails(c *gin.Context) {
	metrics := system.CollectMetrics()

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

	pciDevices := getPCIDevices()
	usbDevices := getUSBDevices()
	motherboard := getMotherboardInfo()
	bios := getBIOSInfo()
	gpu := getGPUInfo(pciDevices)

	var diskList []gin.H
	for _, drive := range metrics.Disk.Drives {
		name := drive.MountPoint
		if name == "/" {
			name = "Primary Host Storage (/)"
		}
		diskList = append(diskList, gin.H{
			"name":       name,
			"device":     drive.Device,
			"model":      drive.FSType + " Partition",
			"type":       drive.FSType,
			"size":       drive.Total,
			"used":       drive.Used,
			"free":       drive.Free,
			"percent":    drive.UsagePercent,
		})
	}
	if len(diskList) == 0 {
		diskList = append(diskList, gin.H{
			"name":   "Primary Host Storage (/)",
			"device": "/dev/root",
			"model":  "Physical Disk",
			"type":   "ext4",
			"size":   metrics.Disk.Total,
			"used":   metrics.Disk.Used,
			"free":   metrics.Disk.Free,
		})
	}

	info := gin.H{
		"hostname":      metrics.Hostname,
		"timezone":      timezone,
		"kernelVersion": metrics.KernelVersion,
		"osVersion":     metrics.OS,
		"cpuModel":      metrics.CPU.Model,
		"cpuCores":      metrics.CPU.Cores,
		"cpuThreads":    metrics.CPU.Cores,
		"ramTotal":      ramTotal,
		"swapTotal":     swapTotal,
		"architecture":  runtime.GOARCH,
		"uptime":        metrics.Uptime,
		"motherboard":   motherboard,
		"bios":          bios,
		"gpu":           gpu,
		"pciDevices":    pciDevices,
		"usbDevices":    usbDevices,
		"disks":          diskList,
		"partitions":     diskList,
	}

	c.JSON(http.StatusOK, info)
}
