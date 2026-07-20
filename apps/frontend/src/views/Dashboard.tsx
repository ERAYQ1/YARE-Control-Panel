import React, { useState, useEffect } from 'react';
import { SystemMetrics } from '@yare/types';
import { metricsStream } from '../services/websocket';
import { StatCard } from '../components/ui/StatCard';
import { formatBytes, formatUptime, formatNetworkSpeed } from '@yare/utils';
import {
  Cpu,
  HardDrive,
  Activity,
  Network,
  Server,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function Dashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<{ time: string; cpu: number; mem: number; rx: number; tx: number }[]>([]);

  useEffect(() => {
    metricsStream.connect();
    const unsubscribe = metricsStream.subscribe((data) => {
      setMetrics(data);
      const timeStr = new Date(data.timestamp * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });

      setHistory((prev) => {
        const next = [...prev, {
          time: timeStr,
          cpu: data.cpu.usagePercent,
          mem: data.memory.usagePercent,
          rx: parseFloat((data.network.rxBytesSec / (1024 * 1024)).toFixed(2)),
          tx: parseFloat((data.network.txBytesSec / (1024 * 1024)).toFixed(2)),
        }];
        return next.slice(-20);
      });
    });

    return () => {
      unsubscribe();
      metricsStream.disconnect();
    };
  }, []);

  if (!metrics) {
    return (
      <div className="p-8 text-center text-muted-theme font-mono text-xs">
        <div className="animate-spin h-5 w-5 border-2 border-primary-theme border-t-transparent rounded-full mx-auto mb-3" />
        <p>Connecting to system metrics telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-mono">
      {/* Top Banner / System Quick Summary */}
      <div className="rounded-xl border border-theme bg-surface-theme p-4 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-card-theme border border-theme text-primary-theme">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-primary-theme flex items-center gap-2">
              {metrics.hostname}
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> ONLINE
              </span>
            </h2>
            <p className="text-xs text-muted-theme mt-0.5">
              {metrics.os} • Kernel {metrics.kernelVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs text-secondary-theme">
          <div>
            <p className="text-[10px] text-muted-theme uppercase font-bold">Uptime</p>
            <p className="font-bold text-primary-theme">{formatUptime(metrics.uptime)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-theme uppercase font-bold">Load Average</p>
            <p className="font-bold text-primary-theme">{metrics.cpu.loadAverage.join(' ')}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-theme uppercase font-bold">Docker Containers</p>
            <p className="font-bold text-primary-theme">
              {metrics.dockerSummary?.containersRunning} / {metrics.dockerSummary?.containersTotal} Running
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="CPU Usage"
          value={`${metrics.cpu.usagePercent}%`}
          subtitle={`${metrics.cpu.cores} Cores • ${metrics.cpu.model.split(' ')[0]}`}
          icon={Cpu}
          percent={metrics.cpu.usagePercent}
        />
        <StatCard
          title="RAM Usage"
          value={`${formatBytes(metrics.memory.used, 1)} / ${formatBytes(metrics.memory.total, 0)}`}
          subtitle={`Swap: ${formatBytes(metrics.memory.swapUsed, 1)}`}
          icon={Activity}
          percent={metrics.memory.usagePercent}
        />
        <StatCard
          title="Disk Storage"
          value={`${formatBytes(metrics.disk.used, 0)} / ${formatBytes(metrics.disk.total, 0)}`}
          subtitle={`${metrics.disk.drives.length} Partitions`}
          icon={HardDrive}
          percent={metrics.disk.usagePercent}
        />
        <StatCard
          title="Network Bandwidth"
          value={`↓ ${formatNetworkSpeed(metrics.network.rxBytesSec)}`}
          subtitle={`↑ ${formatNetworkSpeed(metrics.network.txBytesSec)}`}
          icon={Network}
        />
      </div>

      {/* Realtime Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU & Memory Chart */}
        <div className="rounded-xl border border-theme bg-surface-theme p-4 transition-colors">
          <h3 className="text-xs font-bold text-primary-theme uppercase mb-3 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-muted-theme" /> CPU & Memory Telemetry (%)
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
                <Area type="monotone" dataKey="mem" name="RAM %" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Throughput Chart */}
        <div className="rounded-xl border border-theme bg-surface-theme p-4 transition-colors">
          <h3 className="text-xs font-bold text-primary-theme uppercase mb-3 flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-muted-theme" /> Network Bandwidth (MB/s)
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="rx" name="Download (MB/s)" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
                <Area type="monotone" dataKey="tx" name="Upload (MB/s)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Processes & Storage Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-theme bg-surface-theme p-4 transition-colors">
          <h3 className="text-xs font-bold text-primary-theme uppercase mb-3">Top Processes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary-theme">
              <thead className="border-b border-theme bg-card-theme text-[10px] uppercase text-muted-theme">
                <tr>
                  <th className="py-2 px-3">PID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">CPU %</th>
                  <th className="py-2 px-3">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {metrics.processes.topCpu.map((p, idx) => (
                  <tr key={idx} className="hover:bg-hover-theme">
                    <td className="py-2 px-3 text-primary-theme font-bold">{p.pid}</td>
                    <td className="py-2 px-3 text-primary-theme">{p.name}</td>
                    <td className="py-2 px-3 text-muted-theme">{p.user}</td>
                    <td className="py-2 px-3 text-emerald-500 font-bold">{p.cpuPercent}%</td>
                    <td className="py-2 px-3 text-secondary-theme">{formatBytes(p.memUsage, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-theme bg-surface-theme p-4 transition-colors">
          <h3 className="text-xs font-bold text-primary-theme uppercase mb-3">Storage Partitions</h3>
          <div className="space-y-3">
            {metrics.disk.drives.map((drive, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-card-theme border border-theme space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-primary-theme">
                  <span>{drive.mountPoint}</span>
                  <span>{drive.usagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-theme rounded-full h-1.5 overflow-hidden border border-theme">
                  <div className="bg-primary-theme h-full rounded-full opacity-80" style={{ width: `${drive.usagePercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-theme">
                  <span>{drive.device} ({drive.fsType})</span>
                  <span>{formatBytes(drive.used, 0)} / {formatBytes(drive.total, 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
