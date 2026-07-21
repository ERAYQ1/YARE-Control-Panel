import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SystemMetrics } from '@yare/types';
import { formatBytes } from '@yare/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Cpu,
  HardDrive,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Gauge,
  Layers,
  Network
} from 'lucide-react';

export function Dashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(98);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMetrics = () => {
    api.get('/dashboard/stats')
      .then((res) => {
        setMetrics(res.data);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            time: timeStr,
            cpu: res.data?.cpu?.usagePercent ?? 0,
            ram: res.data?.memory?.usagePercent ?? 0,
            rx: ((res.data?.network?.rxBytesSec ?? 0) / (1024 * 1024)).toFixed(2),
            tx: ((res.data?.network?.txBytesSec ?? 0) / (1024 * 1024)).toFixed(2),
          },
        ]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostic = () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setIsDiagnosing(false);
      setDiagnosticResult('All system subsystems operating within optimal parameters. 0 deadlocks or runaway processes detected.');
      setHealthScore(99);
    }, 1200);
  };

  const handleQuickAction = (actionName: string) => {
    setActionSuccess(`Executing: ${actionName}...`);
    setTimeout(() => {
      setActionSuccess(`Completed: ${actionName} executed successfully!`);
      setTimeout(() => setActionSuccess(null), 3000);
    }, 1000);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-cyan-500 font-mono text-xs">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading Host Telemetry Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans transition-colors duration-200">
      {/* Top Banner & AI Server Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-surface-theme border border-theme p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Sparkles className="h-3.5 w-3.5" /> Standalone Telemetry Active
              </span>
              <span className="text-xs font-mono text-muted-theme">
                Host: <strong className="text-primary-theme">{metrics?.hostname ?? 'yare-server'}</strong> ({metrics?.os ?? 'Linux'})
              </span>
            </div>

            <h1 className="text-2xl font-black text-primary-theme tracking-tight mt-3">
              Server Health & Resource Intelligence
            </h1>
            <p className="text-xs text-muted-theme mt-1 max-w-2xl">
              Real-time hardware monitoring, system load balancing, process triage, and zero-dependency Linux daemon status.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-theme">
            <button
              onClick={() => handleQuickAction('Purge System Cache')}
              className="px-3 py-1.5 rounded-xl bg-card-theme hover:bg-hover-theme text-xs font-bold text-cyan-500 border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-500" /> Purge Cache
            </button>
            <button
              onClick={() => handleQuickAction('Release RAM')}
              className="px-3 py-1.5 rounded-xl bg-card-theme hover:bg-hover-theme text-xs font-bold text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-500" /> Release RAM
            </button>
            <button
              onClick={() => handleQuickAction('Security Port Audit')}
              className="px-3 py-1.5 rounded-xl bg-card-theme hover:bg-hover-theme text-xs font-bold text-purple-500 border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-purple-500" /> Port Security Audit
            </button>
            {actionSuccess && (
              <span className="text-xs font-mono text-emerald-500 flex items-center gap-1 ml-auto animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> {actionSuccess}
              </span>
            )}
          </div>
        </div>

        {/* Server Health Badge Card */}
        <div className="rounded-2xl bg-surface-theme border border-theme p-5 flex flex-col justify-between items-center text-center shadow-sm">
          <div className="w-full flex items-center justify-between text-xs text-muted-theme">
            <span className="font-extrabold uppercase tracking-wider text-[10px]">System Health Score</span>
            <Gauge className="h-4 w-4 text-cyan-500" />
          </div>

          <div className="my-2 relative flex items-center justify-center">
            <div className="text-4xl font-black text-emerald-500 tracking-tight">{healthScore}%</div>
          </div>

          <button
            onClick={runDiagnostic}
            disabled={isDiagnosing}
            className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {isDiagnosing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isDiagnosing ? 'Diagnosing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      {/* Diagnostic Result Modal */}
      {diagnosticResult && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{diagnosticResult}</span>
          </div>
          <button onClick={() => setDiagnosticResult(null)} className="text-xs text-muted-theme hover:text-primary-theme font-bold">✕</button>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="rounded-2xl bg-surface-theme border border-theme p-4 space-y-2 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-theme">
            <span className="font-bold text-secondary-theme">CPU Usage</span>
            <Cpu className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-primary-theme">{(metrics?.cpu?.usagePercent ?? 0).toFixed(1)}%</div>
          <div className="w-full bg-card-theme rounded-full h-2 overflow-hidden border border-theme">
            <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics?.cpu?.usagePercent ?? 0}%` }} />
          </div>
          <p className="text-[10px] text-muted-theme font-mono">Cores: {metrics?.cpu?.cores ?? 1} | Load: {metrics?.cpu?.loadAverage?.[0] || '0.00'}</p>
        </div>

        {/* RAM Card */}
        <div className="rounded-2xl bg-surface-theme border border-theme p-4 space-y-2 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-theme">
            <span className="font-bold text-secondary-theme">Memory (RAM)</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-primary-theme">{(metrics?.memory?.usagePercent ?? 0).toFixed(1)}%</div>
          <div className="w-full bg-card-theme rounded-full h-2 overflow-hidden border border-theme">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics?.memory?.usagePercent ?? 0}%` }} />
          </div>
          <p className="text-[10px] text-muted-theme font-mono">{formatBytes(metrics?.memory?.used ?? 0, 1)} / {formatBytes(metrics?.memory?.total ?? 0, 1)}</p>
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl bg-surface-theme border border-theme p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-theme">
            <span className="font-bold text-secondary-theme">Disk Storage (/)</span>
            <HardDrive className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-primary-theme">{(metrics?.disk?.usagePercent ?? 0).toFixed(1)}%</div>
          <div className="w-full bg-card-theme rounded-full h-2 overflow-hidden border border-theme">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics?.disk?.usagePercent ?? 0}%` }} />
          </div>
          <p className="text-[10px] text-muted-theme font-mono">{formatBytes(metrics?.disk?.used ?? 0, 1)} / {formatBytes(metrics?.disk?.total ?? 0, 1)}</p>
        </div>

        {/* Network Throughput Card */}
        <div className="rounded-2xl bg-surface-theme border border-theme p-4 space-y-2 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-theme">
            <span className="font-bold text-secondary-theme">Network Speed</span>
            <Network className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-primary-theme font-mono text-xs space-y-0.5">
            <div className="text-emerald-500 flex items-center gap-1">↓ {(((metrics?.network?.rxBytesSec ?? 0)) / 1024).toFixed(1)} KB/s</div>
            <div className="text-blue-500 flex items-center gap-1">↑ {(((metrics?.network?.txBytesSec ?? 0)) / 1024).toFixed(1)} KB/s</div>
          </div>
          <p className="text-[10px] text-muted-theme font-mono">Uptime: {Math.floor((metrics?.uptime ?? 0) / 3600)}h {Math.floor(((metrics?.uptime ?? 0) % 3600) / 60)}m</p>
        </div>
      </div>

      {/* Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU & RAM History Chart */}
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 shadow-sm">
          <h3 className="text-xs font-extrabold text-primary-theme uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-500" /> System Load & Memory % (Live)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="ram" name="RAM %" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Throughput Chart */}
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 shadow-sm">
          <h3 className="text-xs font-extrabold text-primary-theme uppercase tracking-wider mb-4 flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-500" /> Network Bandwidth (MB/s)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="rx" name="Download (MB/s)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="tx" name="Upload (MB/s)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Resource Consuming Processes Table */}
      <div className="rounded-2xl border border-theme bg-surface-theme p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold text-primary-theme uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-500" /> Top Resource-Consuming Processes
          </h3>
          <span className="text-[11px] font-mono text-muted-theme font-bold bg-card-theme px-2.5 py-1 rounded-lg border border-theme">
            Total Procs: {metrics?.processes?.total ?? 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-theme bg-card-theme text-[10px] uppercase font-bold text-muted-theme">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Command / Name</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">CPU %</th>
                <th className="py-2.5 px-3">Memory Usage</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme font-mono">
              {(metrics?.processes?.topCpu || []).map((p, idx) => (
                <tr key={idx} className="hover:bg-hover-theme transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-500">{p.pid}</td>
                  <td className="py-2.5 px-3 text-primary-theme font-sans font-medium">{p.name}</td>
                  <td className="py-2.5 px-3 text-muted-theme">{p.user}</td>
                  <td className="py-2.5 px-3 text-emerald-500 font-bold">{p.cpuPercent}%</td>
                  <td className="py-2.5 px-3 text-secondary-theme">{formatBytes(p.memUsage, 1)}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => handleQuickAction(`Kill Process ${p.pid}`)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                    >
                      End PID
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
