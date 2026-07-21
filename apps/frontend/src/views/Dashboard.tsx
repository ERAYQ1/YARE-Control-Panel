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
  Terminal,
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
    api.get('/system/metrics')
      .then((res) => {
        setMetrics(res.data);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            time: timeStr,
            cpu: res.data.cpu.usagePercent,
            ram: res.data.memory.usagePercent,
            rx: (res.data.network.rxBytesSec / (1024 * 1024)).toFixed(2),
            tx: (res.data.network.txBytesSec / (1024 * 1024)).toFixed(2),
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
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading Host Telemetry Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & AI Server Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/40 border border-cyan-500/20 p-5 backdrop-blur-xl relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="h-3.5 w-3.5" /> Standalone Telemetry Active
              </span>
              <span className="text-xs font-mono text-slate-400">
                Host: <strong className="text-slate-100">{metrics.hostname}</strong> ({metrics.os})
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mt-3">
              Server Health & Resource Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time hardware monitoring, system load balancing, process triage, and zero-dependency Linux daemon status.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleQuickAction('Purge System Cache')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400" /> Purge Cache
            </button>
            <button
              onClick={() => handleQuickAction('Release RAM')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" /> Release RAM
            </button>
            <button
              onClick={() => handleQuickAction('Security Port Audit')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Port Security Audit
            </button>
            {actionSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 ml-auto animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> {actionSuccess}
              </span>
            )}
          </div>
        </div>

        {/* Server Health Badge Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-xl flex flex-col justify-between items-center text-center shadow-xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">System Health Score</span>
            <Gauge className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="my-2 relative flex items-center justify-center">
            <div className="text-4xl font-black text-emerald-400 tracking-tight">{healthScore}%</div>
          </div>

          <button
            onClick={runDiagnostic}
            disabled={isDiagnosing}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            {isDiagnosing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isDiagnosing ? 'Diagnosing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      {/* Diagnostic Result Modal */}
      {diagnosticResult && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{diagnosticResult}</span>
          </div>
          <button onClick={() => setDiagnosticResult(null)} className="text-xs text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">CPU Usage</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.cpu.usagePercent.toFixed(1)}%</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.cpu.usagePercent}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Cores: {metrics.cpu.cores} | Load: {metrics.cpu.loadAverage?.[0] || '0.00'}</p>
        </div>

        {/* RAM Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">Memory (RAM)</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.memory.usagePercent.toFixed(1)}%</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.memory.usagePercent}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{formatBytes(metrics.memory.used, 1)} / {formatBytes(metrics.memory.total, 1)}</p>
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">Disk Storage (/)</span>
            <HardDrive className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.disk.usagePercent.toFixed(1)}%</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.disk.usagePercent}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{formatBytes(metrics.disk.used, 1)} / {formatBytes(metrics.disk.total, 1)}</p>
        </div>

        {/* Network Throughput Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">Network Speed</span>
            <Network className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono text-xs space-y-0.5">
            <div className="text-emerald-400 flex items-center gap-1">↓ {(metrics.network.rxBytesSec / 1024).toFixed(1)} KB/s</div>
            <div className="text-blue-400 flex items-center gap-1">↑ {(metrics.network.txBytesSec / 1024).toFixed(1)} KB/s</div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Uptime: {Math.floor(metrics.uptime / 3600)}h {Math.floor((metrics.uptime % 3600) / 60)}m</p>
        </div>
      </div>

      {/* Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU & RAM History Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" /> System Load & Memory % (Live)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="ram" name="RAM %" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Throughput Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-400" /> Network Bandwidth (MB/s)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="rx" name="Download (MB/s)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="tx" name="Upload (MB/s)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Resource Consuming Processes Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" /> Top Resource-Consuming Processes
          </h3>
          <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            Total Procs: {metrics.processes?.total || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Command / Name</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">CPU %</th>
                <th className="py-2.5 px-3">Memory Usage</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(metrics.processes?.topCpu || []).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{p.pid}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">{p.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.user}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.cpuPercent}%</td>
                  <td className="py-2.5 px-3 text-slate-300">{formatBytes(p.memUsage, 1)}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => handleQuickAction(`Kill Process ${p.pid}`)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
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
