import { SystemMetrics } from '@yare/types';

export class MetricsWebSocket {
  private ws: WebSocket | null = null;
  private listeners: ((metrics: SystemMetrics) => void)[] = [];
  private reconnectTimer: number | null = null;
  private reconnectDelay = 2000;
  private isConnected = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('yare_token') || '';
    const wsUrl = `${protocol}//${host}/api/v1/ws/metrics?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectDelay = 2000;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SystemMetrics;
          this.notify(data);
        } catch (e) {
          console.error('Failed to parse WebSocket metrics telemetry', e);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };
    } catch (e) {
      this.isConnected = false;
      this.scheduleReconnect();
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

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const metricsStream = new MetricsWebSocket();
