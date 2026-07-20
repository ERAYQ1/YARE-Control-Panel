import { SystemMetrics } from '@yare/types';

export class MetricsWebSocket {
  private ws: WebSocket | null = null;
  private listeners: ((metrics: SystemMetrics) => void)[] = [];
  private mockInterval: number | null = null;

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('yare_token') || '';
    const wsUrl = `${protocol}//${host}/api/v1/ws/metrics?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SystemMetrics;
          this.notify(data);
        } catch (e) {
          console.error('Failed to parse WebSocket metrics message', e);
        }
      };

      this.ws.onerror = () => {
        this.startMockStream();
      };

      this.ws.onclose = () => {
        this.startMockStream();
      };
    } catch {
      this.startMockStream();
    }
  }

  subscribe(callback: (metrics: SystemMetrics) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(data: SystemMetrics) {
    this.listeners.forEach((fn) => fn(data));
  }

  private startMockStream() {
    if (this.mockInterval) return;

    this.mockInterval = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const mockMetrics: SystemMetrics = {
        timestamp: now,
        hostname: 'yare-node-ubuntu-24',
        os: 'Ubuntu 24.04.1 LTS',
        platform: 'linux',
        kernelVersion: '6.8.0-40-generic',
        uptime: 310540,
        cpu: {
          model: 'AMD EPYC 7763 64-Core Processor',
          cores: 16,
          usagePercent: parseFloat((15 + Math.random() * 8).toFixed(1)),
          temperature: parseFloat((41.5 + Math.random() * 2.5).toFixed(1)),
          loadAverage: [0.45, 0.52, 0.48],
        },
        memory: {
          total: 32 * 1024 * 1024 * 1024,
          used: 12.4 * 1024 * 1024 * 1024,
          free: 19.6 * 1024 * 1024 * 1024,
          usagePercent: 38.7,
          swapTotal: 4 * 1024 * 1024 * 1024,
          swapUsed: 0.2 * 1024 * 1024 * 1024,
          swapPercent: 5.0,
        },
        disk: {
          total: 512 * 1024 * 1024 * 1024,
          used: 128 * 1024 * 1024 * 1024,
          free: 384 * 1024 * 1024 * 1024,
          usagePercent: 25.0,
          drives: [
            { device: '/dev/nvme0n1p2', mountPoint: '/', fsType: 'ext4', total: 512 * 1024 * 1024 * 1024, used: 128 * 1024 * 1024 * 1024, free: 384 * 1024 * 1024 * 1024, usagePercent: 25.0 },
            { device: '/dev/sda1', mountPoint: '/var/lib/docker', fsType: 'ext4', total: 1000 * 1024 * 1024 * 1024, used: 210 * 1024 * 1024 * 1024, free: 790 * 1024 * 1024 * 1024, usagePercent: 21.0 }
          ]
        },
        network: {
          rxBytesSec: Math.floor(180000 + Math.random() * 60000),
          txBytesSec: Math.floor(64000 + Math.random() * 25000),
          totalRx: 1024 * 1024 * 1450,
          totalTx: 1024 * 1024 * 820,
          interfaces: [
            { name: 'eth0', ipAddress: '192.168.1.120', macAddress: '02:42:ac:11:00:02', isUp: true, rxBytes: 1024 * 1024 * 1450, txBytes: 1024 * 1024 * 820 },
            { name: 'docker0', ipAddress: '172.17.0.1', macAddress: '02:42:be:89:12:ef', isUp: true, rxBytes: 1024 * 1024 * 210, txBytes: 1024 * 1024 * 180 }
          ]
        },
        processes: {
          total: 184,
          running: 5,
          topCpu: [
            { pid: 1042, name: 'dockerd', user: 'root', cpuPercent: 4.2, memPercent: 1.8, memUsage: 280 * 1024 * 1024, status: 'running' },
            { pid: 1894, name: 'yare-backend', user: 'yare', cpuPercent: 1.2, memPercent: 0.4, memUsage: 45 * 1024 * 1024, status: 'running' },
            { pid: 844, name: 'nginx', user: 'www-data', cpuPercent: 0.8, memPercent: 0.2, memUsage: 18 * 1024 * 1024, status: 'running' },
            { pid: 3120, name: 'postgres', user: 'postgres', cpuPercent: 0.5, memPercent: 2.1, memUsage: 340 * 1024 * 1024, status: 'running' }
          ],
          topMemory: [
            { pid: 3120, name: 'postgres', user: 'postgres', cpuPercent: 0.5, memPercent: 2.1, memUsage: 340 * 1024 * 1024, status: 'running' },
            { pid: 1042, name: 'dockerd', user: 'root', cpuPercent: 4.2, memPercent: 1.8, memUsage: 280 * 1024 * 1024, status: 'running' },
            { pid: 4051, name: 'redis-server', user: 'redis', cpuPercent: 0.3, memPercent: 0.5, memUsage: 78 * 1024 * 1024, status: 'running' }
          ]
        },
        dockerSummary: {
          containersTotal: 12,
          containersRunning: 9,
          imagesTotal: 8
        }
      };
      this.notify(mockMetrics);
    }, 1000);
  }

  disconnect() {
    if (this.mockInterval) clearInterval(this.mockInterval);
    if (this.ws) this.ws.close();
  }
}

export const metricsStream = new MetricsWebSocket();
