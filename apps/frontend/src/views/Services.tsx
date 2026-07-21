import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SystemService } from '@yare/types';
import { getStateBadgeColor, formatBytes } from '@yare/utils';
import { DataTable, Column } from '../components/ui/DataTable';
import { Activity, Play, Square, RotateCw, CheckCircle, XCircle, ScrollText } from 'lucide-react';

export function Services() {
  const [services, setServices] = useState<SystemService[]>([]);
  const [filterState, setFilterState] = useState<'all' | 'active' | 'inactive' | 'failed'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogsService, setSelectedLogsService] = useState<string | null>(null);

  const fetchServices = () => {
    setIsLoading(true);
    api.get('/services')
      .then((res) => setServices(res.data))
      .catch(() => setServices([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAction = (serviceName: string, action: string) => {
    api.post(`/services/${serviceName}/${action}`)
      .then(() => fetchServices());
  };

  const filteredServices = services.filter((s) => {
    if (filterState === 'all') return true;
    return s.activeState.toLowerCase() === filterState;
  });

  const columns: Column<SystemService>[] = [
    {
      header: 'Service Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-200 font-mono text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'activeState',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStateBadgeColor(row.activeState)}`}>
          {row.activeState === 'active' ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
          {row.activeState} ({row.subState})
        </span>
      ),
    },
    {
      header: 'PID',
      accessorKey: 'pid',
      cell: (row) => <span className="font-mono text-slate-400">{row.pid || '-'}</span>,
    },
    {
      header: 'RAM Usage',
      accessorKey: 'memoryUsage',
      cell: (row) => <span className="font-mono text-slate-300">{row.memoryUsage ? formatBytes(row.memoryUsage, 1) : '-'}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.activeState === 'active' ? (
            <button
              onClick={() => handleAction(row.name, 'stop')}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
              title="Stop Service"
            >
              <Square className="h-3.5 w-3.5 fill-rose-400" />
            </button>
          ) : (
            <button
              onClick={() => handleAction(row.name, 'start')}
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              title="Start Service"
            >
              <Play className="h-3.5 w-3.5 fill-emerald-400" />
            </button>
          )}

          <button
            onClick={() => handleAction(row.name, 'restart')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Restart Service"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setSelectedLogsService(row.name)}
            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
            title="View Journal Logs"
          >
            <ScrollText className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" /> Systemd Services Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">Control system daemons, view runtime metrics, and inspect journalctl logs.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-slate-800 bg-slate-950">
          {(['all', 'active', 'inactive', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterState(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterState === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredServices}
        searchPlaceholder="Search systemd services..."
        isLoading={isLoading}
        exportFilename="system_services.csv"
      />

      {/* Logs Drawer */}
      {selectedLogsService && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-400" /> journalctl -u {selectedLogsService}
              </h3>
              <button onClick={() => setSelectedLogsService(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1 h-64 overflow-y-auto">
              <p className="text-slate-500">-- Logs begin at Mon 2026-07-20 08:00:00 UTC --</p>
              <p><span className="text-slate-500">14:20:01</span> systemd[1]: Started {selectedLogsService}.</p>
              <p><span className="text-slate-500">14:20:02</span> {selectedLogsService}[1894]: Worker thread initialized.</p>
              <p><span className="text-slate-500">14:20:05</span> {selectedLogsService}[1894]: Listening on 0.0.0.0:8080.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
