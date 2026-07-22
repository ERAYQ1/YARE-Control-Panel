package system

import (
	"bufio"
	"math"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

type ProcessInfo struct {
	PID        int32   `json:"pid"`
	Name       string  `json:"name"`
	User       string  `json:"user"`
	CPUPercent float64 `json:"cpuPercent"`
	MemPercent float32 `json:"memPercent"`
	MemUsage   uint64  `json:"memUsage"`
	Status     string  `json:"status"`
}

type MountedDrive struct {
	Device       string  `json:"device"`
	MountPoint   string  `json:"mountPoint"`
	FSType       string  `json:"fsType"`
	Total        uint64  `json:"total"`
	Used         uint64  `json:"used"`
	Free         uint64  `json:"free"`
	UsagePercent float64 `json:"usagePercent"`
}

type NetworkInterfaceInfo struct {
	Name       string `json:"name"`
	IPAddress  string `json:"ipAddress"`
	MACAddress string `json:"macAddress"`
	IsUp       bool   `json:"isUp"`
	RxBytes    uint64 `json:"rxBytes"`
	TxBytes    uint64 `json:"txBytes"`
}

type SystemMetrics struct {
	Timestamp     int64          `json:"timestamp"`
	Hostname      string         `json:"hostname"`
	OS            string         `json:"os"`
	Platform      string         `json:"platform"`
	KernelVersion string         `json:"kernelVersion"`
	Uptime        uint64         `json:"uptime"`
	CPU           CPUSpec        `json:"cpu"`
	Memory        MemSpec        `json:"memory"`
	Disk          DiskSpec       `json:"disk"`
	Network       NetSpec        `json:"network"`
	Processes     ProcSpec       `json:"processes"`
}

type CPUSpec struct {
	Model        string     `json:"model"`
	Cores        int        `json:"cores"`
	UsagePercent float64    `json:"usagePercent"`
	Temperature  float64    `json:"temperature,omitempty"`
	LoadAverage  [3]float64 `json:"loadAverage"`
}

type MemSpec struct {
	Total        uint64  `json:"total"`
	Used         uint64  `json:"used"`
	Free         uint64  `json:"free"`
	UsagePercent float64 `json:"usagePercent"`
	SwapTotal    uint64  `json:"swapTotal"`
	SwapUsed     uint64  `json:"swapUsed"`
	SwapPercent  float64 `json:"swapPercent"`
}

type DiskSpec struct {
	Total        uint64         `json:"total"`
	Used         uint64         `json:"used"`
	Free         uint64         `json:"free"`
	UsagePercent float64        `json:"usagePercent"`
	Drives       []MountedDrive `json:"drives"`
}

type NetSpec struct {
	RxBytesSec int64                  `json:"rxBytesSec"`
	TxBytesSec int64                  `json:"txBytesSec"`
	TotalRx    uint64                 `json:"totalRx"`
	TotalTx    uint64                 `json:"totalTx"`
	Interfaces []NetworkInterfaceInfo `json:"interfaces"`
}

type ProcSpec struct {
	Total     int           `json:"total"`
	Running   int           `json:"running"`
	TopCPU    []ProcessInfo `json:"topCpu"`
	TopMemory []ProcessInfo `json:"topMemory"`
}



var lastRx uint64
var lastTx uint64
var lastSampleTime time.Time

func init() {
	// Configure gopsutil to inspect host proc, sys, and etc mounts if present
	if _, err := os.Stat("/host/proc"); err == nil {
		_ = os.Setenv("HOST_PROC", "/host/proc")
	}
	if _, err := os.Stat("/host/sys"); err == nil {
		_ = os.Setenv("HOST_SYS", "/host/sys")
	}
	if _, err := os.Stat("/host/etc"); err == nil {
		_ = os.Setenv("HOST_ETC", "/host/etc")
	}
}

func getHostHostname() string {
	if envHost := os.Getenv("HOST_HOSTNAME"); envHost != "" {
		return strings.TrimSpace(envHost)
	}
	paths := []string{"/host/etc/hostname", "/hostroot/etc/hostname", "/etc/hostname"}
	for _, p := range paths {
		if content, err := os.ReadFile(p); err == nil {
			trimmed := strings.TrimSpace(string(content))
			if trimmed != "" {
				return trimmed
			}
		}
	}
	h, _ := os.Hostname()
	if h != "" {
		return h
	}
	return "yare-server"
}

func getHostOS() string {
	paths := []string{"/host/etc/os-release", "/hostroot/etc/os-release", "/etc/os-release"}
	for _, p := range paths {
		if file, err := os.Open(p); err == nil {
			defer file.Close()
			scanner := bufio.NewScanner(file)
			var prettyName, name, version string
			for scanner.Scan() {
				line := strings.TrimSpace(scanner.Text())
				if strings.HasPrefix(line, "PRETTY_NAME=") {
					prettyName = strings.Trim(strings.TrimPrefix(line, "PRETTY_NAME="), `"`)
				} else if strings.HasPrefix(line, "NAME=") {
					name = strings.Trim(strings.TrimPrefix(line, "NAME="), `"`)
				} else if strings.HasPrefix(line, "VERSION_ID=") || strings.HasPrefix(line, "VERSION=") {
					version = strings.Trim(strings.Trim(strings.TrimPrefix(line, "VERSION_ID="), "VERSION="), `"`)
				}
			}
			if prettyName != "" {
				return prettyName
			}
			if name != "" {
				if version != "" {
					return name + " " + version
				}
				return name
			}
		}
	}
	hostInfo, err := host.Info()
	if err == nil && hostInfo != nil && hostInfo.Platform != "" {
		return hostInfo.Platform + " " + hostInfo.PlatformVersion
	}
	return runtime.GOOS
}

func getCPUModel() (string, int) {
	cores := runtime.NumCPU()
	cpuInfo, err := cpu.Info()
	if err == nil && len(cpuInfo) > 0 && cpuInfo[0].ModelName != "" {
		return cpuInfo[0].ModelName, cores
	}
	paths := []string{"/host/proc/cpuinfo", "/proc/cpuinfo"}
	for _, p := range paths {
		if file, err := os.Open(p); err == nil {
			defer file.Close()
			scanner := bufio.NewScanner(file)
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "model name") {
					parts := strings.Split(line, ":")
					if len(parts) > 1 {
						return strings.TrimSpace(parts[1]), cores
					}
				}
			}
		}
	}
	return "Generic CPU Processor", cores
}

func CollectMetrics() *SystemMetrics {
	hostname := getHostHostname()
	osName := getHostOS()

	hostInfo, _ := host.Info()
	var kernelVersion string
	var uptime uint64
	if hostInfo != nil {
		kernelVersion = hostInfo.KernelVersion
		uptime = hostInfo.Uptime
	}

	// CPU Stats
	cpuPercents, _ := cpu.Percent(0, false)
	var cpuUsage float64
	if len(cpuPercents) > 0 {
		cpuUsage = cpuPercents[0]
	}
	cpuModel, cores := getCPUModel()

	// Memory Stats
	vMem, err := mem.VirtualMemory()
	var memTotal, memUsed, memFree uint64
	var memPercent float64
	if err == nil && vMem != nil {
		memTotal = vMem.Total
		memUsed = vMem.Used
		memFree = vMem.Free
		memPercent = vMem.UsedPercent
	}

	swapMem, _ := mem.SwapMemory()
	var swapTotal, swapUsed uint64
	var swapPercent float64
	if swapMem != nil {
		swapTotal = swapMem.Total
		swapUsed = swapMem.Used
		swapPercent = swapMem.UsedPercent
	}

	// Disk Stats: Filter host root storage specifically to avoid overlay duplication
	var diskTotal, diskUsed, diskFree uint64
	var drives []MountedDrive

	hostRootTarget := "/"
	if _, err := os.Stat("/hostroot"); err == nil {
		hostRootTarget = "/hostroot"
	}

	rootUsage, err := disk.Usage(hostRootTarget)
	if err == nil && rootUsage != nil {
		diskTotal = rootUsage.Total
		diskUsed = rootUsage.Used
		diskFree = rootUsage.Free
		drives = append(drives, MountedDrive{
			Device:       rootUsage.Path,
			MountPoint:   "/",
			FSType:       rootUsage.Fstype,
			Total:        rootUsage.Total,
			Used:         rootUsage.Used,
			Free:         rootUsage.Free,
			UsagePercent: math.Round(rootUsage.UsedPercent*10) / 10,
		})
	}

	// Scan extra physical non-overlay partitions
	partitions, _ := disk.Partitions(false)
	ignoredFS := map[string]bool{
		"overlay": true, "tmpfs": true, "devtmpfs": true, "squashfs": true,
		"proc": true, "sysfs": true, "cgroup": true, "nsfs": true, "devpts": true,
	}

	for _, p := range partitions {
		if ignoredFS[p.Fstype] || strings.Contains(p.Mountpoint, "/docker/") || strings.Contains(p.Mountpoint, "/containers/") {
			continue
		}
		if p.Mountpoint == "/" || p.Mountpoint == "/hostroot" {
			continue
		}
		usage, err := disk.Usage(p.Mountpoint)
		if err == nil && usage != nil && usage.Total > 0 {
			displayMount := p.Mountpoint
			if strings.HasPrefix(displayMount, "/hostroot") {
				displayMount = strings.TrimPrefix(displayMount, "/hostroot")
				if displayMount == "" {
					displayMount = "/"
				}
			}
			drives = append(drives, MountedDrive{
				Device:       p.Device,
				MountPoint:   displayMount,
				FSType:       p.Fstype,
				Total:        usage.Total,
				Used:         usage.Used,
				Free:         usage.Free,
				UsagePercent: math.Round(usage.UsedPercent*10) / 10,
			})
		}
	}

	diskUsagePercent := 0.0
	if diskTotal > 0 {
		diskUsagePercent = (float64(diskUsed) / float64(diskTotal)) * 100
	}

	// Network Stats
	netIOCounters, _ := net.IOCounters(false)
	var totalRx, totalTx uint64
	if len(netIOCounters) > 0 {
		totalRx = netIOCounters[0].BytesRecv
		totalTx = netIOCounters[0].BytesSent
	}

	var rxSec, txSec int64
	now := time.Now()
	if !lastSampleTime.IsZero() {
		elapsed := now.Sub(lastSampleTime).Seconds()
		if elapsed > 0 {
			rxSec = int64(float64(totalRx-lastRx) / elapsed)
			txSec = int64(float64(totalTx-lastTx) / elapsed)
		}
	}
	if rxSec < 0 {
		rxSec = 0
	}
	if txSec < 0 {
		txSec = 0
	}
	lastRx = totalRx
	lastTx = totalTx
	lastSampleTime = now

	netInterfaces, _ := net.Interfaces()
	var ifaceInfos []NetworkInterfaceInfo
	for _, iface := range netInterfaces {
		var ipAddr string
		if len(iface.Addrs) > 0 {
			ipAddr = iface.Addrs[0].Addr
		}
		isUp := false
		for _, flag := range iface.Flags {
			if flag == "up" {
				isUp = true
				break
			}
		}
		ifaceInfos = append(ifaceInfos, NetworkInterfaceInfo{
			Name:       iface.Name,
			IPAddress:  ipAddr,
			MACAddress: iface.HardwareAddr,
			IsUp:       isUp,
		})
	}

	// Processes
	procList, _ := process.Processes()
	var topCPU []ProcessInfo
	var topMem []ProcessInfo
	runningCount := 0

	for i, p := range procList {
		status, _ := p.Status()
		if len(status) > 0 && (status[0] == "R" || status[0] == "running") {
			runningCount++
		}
		if i < 10 {
			name, _ := p.Name()
			user, _ := p.Username()
			cpuP, _ := p.CPUPercent()
			memP, _ := p.MemoryPercent()
			memInfo, _ := p.MemoryInfo()
			var mUsage uint64
			if memInfo != nil {
				mUsage = memInfo.RSS
			}

			proc := ProcessInfo{
				PID:        p.Pid,
				Name:       name,
				User:       user,
				CPUPercent: math.Round(cpuP*10) / 10,
				MemPercent: memP,
				MemUsage:   mUsage,
				Status:     "running",
			}
			topCPU = append(topCPU, proc)
			topMem = append(topMem, proc)
		}
	}

	return &SystemMetrics{
		Timestamp:     now.Unix(),
		Hostname:      hostname,
		OS:            osName,
		Platform:      runtime.GOOS,
		KernelVersion: kernelVersion,
		Uptime:        uptime,
		CPU: CPUSpec{
			Model:        cpuModel,
			Cores:        cores,
			UsagePercent: math.Round(cpuUsage*10) / 10,
		},
		Memory: MemSpec{
			Total:        memTotal,
			Used:         memUsed,
			Free:         memFree,
			UsagePercent: math.Round(memPercent*10) / 10,
			SwapTotal:    swapTotal,
			SwapUsed:     swapUsed,
			SwapPercent:  swapPercent,
		},
		Disk: DiskSpec{
			Total:        diskTotal,
			Used:         diskUsed,
			Free:         diskFree,
			UsagePercent: math.Round(diskUsagePercent*10) / 10,
			Drives:       drives,
		},
		Network: NetSpec{
			RxBytesSec: rxSec,
			TxBytesSec: txSec,
			TotalRx:    totalRx,
			TotalTx:    totalTx,
			Interfaces: ifaceInfos,
		},
		Processes: ProcSpec{
			Total:     len(procList),
			Running:   runningCount,
			TopCPU:    topCPU,
			TopMemory: topMem,
		},
	}
}
