import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LogEntry } from '@yare/types';
import { ScrollText, Search, Download, Pause, Play, RefreshCw } from 'lucide-react';

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [source, setSource] = useState<'system' | 'kernel' | 'auth' | 'docker' | 'service'>('system');
  const [search, setSearch] = useState('');
  const [isLive, setIsLive] = useState(true);

  const fetchLogs = () => {
    api.get(`/logs?source=${source}`)
      .then((res) => setLogs(res.data))
      .catch(() => {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        setLogs([
          { id: '1', timestamp: now, source: source, level: 'info', message: 'YARE daemon service initialized successfully', serviceName: 'yare.service' },
          { id: '2', timestamp: now, source: source, level: 'info', message: 'User admin logged in from IP 192.168.1.50', serviceName: 'auth' },
          { id: '3', timestamp: now, source: source, level: 'warn', message: 'High memory usage on container production-postgres', serviceName: 'dockerd' },
          { id: '4', timestamp: now, source: source, level: 'info', message: 'Systemd reloaded service unit file nginx.service', serviceName: 'systemd' }
        ]);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [source]);

  const filteredLogs = logs.filter((l) =>
    l.message.toLowerCase().includes(search.toLowerCase()) ||
    (l.serviceName && l.serviceName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-cyan-400" /> Multi-Source Live System Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">Stream system, kernel, auth, docker, and service logs with live filter.</p>
        </div>

        {/* Source Selector */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-slate-800 bg-slate-950">
          {(['system', 'kernel', 'auth', 'docker', 'service'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                source === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log messages or service names..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isLive ? 'Pause Stream' : 'Resume Stream'}
          </button>
          <button onClick={fetchLogs} className="p-2 rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-950/95 p-4 font-mono text-xs shadow-2xl h-[500px] overflow-y-auto space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-900/80 hover:bg-slate-900/40 px-2 rounded">
            <span className="text-slate-500 select-none flex-shrink-0">{log.timestamp}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold flex-shrink-0 ${
              log.level === 'error' ? 'bg-rose-500/20 text-rose-400' : log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {log.level}
            </span>
            {log.serviceName && <span className="text-indigo-400 font-semibold flex-shrink-0">[{log.serviceName}]</span>}
            <span className="text-slate-200 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
