import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, ToggleLeft, ToggleRight, RefreshCw, Inbox, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  enabled: boolean;
  last_run: string;
  last_status: string;
  created_at: string;
}

export const CronManagerView: React.FC = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('0 0 * * *');
  const [command, setCommand] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/cron', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : []);
      } else {
        setJobs([]);
      }
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, schedule, command })
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setCommand('');
        fetchJobs();
      }
    } catch (e) {
      alert('Error creating cron job');
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      const token = localStorage.getItem('yare_token');
      await fetch(`/api/v1/cron/${id}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cron execution started');
      setTimeout(fetchJobs, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('yare_token');
      await fetch(`/api/v1/cron/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete cron job?')) return;
    try {
      const token = localStorage.getItem('yare_token');
      await fetch(`/api/v1/cron/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-theme flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            {t('cron')}
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Automated Linux background cron job scheduler & manual trigger engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            className="p-2 text-muted-theme hover:text-primary-theme bg-card-theme border border-theme rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Add Scheduled Task
          </button>
        </div>
      </div>

      <div className="bg-surface-theme border border-theme rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-theme font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Fetching scheduled jobs...
          </div>
        ) : safeJobs.length === 0 ? (
          <div className="p-12 text-center text-muted-theme space-y-2">
            <Inbox className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs">No scheduled cron tasks configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary-theme">
              <thead className="bg-card-theme text-muted-theme uppercase text-[10px] border-b border-theme font-bold">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Cron Expression</th>
                  <th className="px-4 py-3">Command</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Last Run</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme font-mono">
                {safeJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-hover-theme transition">
                    <td className="px-4 py-3 font-bold text-primary-theme flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {j.name}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-bold">{j.schedule}</td>
                    <td className="px-4 py-3 text-muted-theme truncate max-w-xs">{j.command}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(j.id)} className="flex items-center gap-1">
                        {j.enabled ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-theme" />
                        )}
                        <span className={`text-[10px] font-bold ${j.enabled ? 'text-emerald-400' : 'text-muted-theme'}`}>
                          {j.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-theme">{j.last_run || 'Never'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunNow(j.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          title="Run Task Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Cron Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-theme border border-theme rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Add Scheduled Cron Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-theme hover:text-primary-theme">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-theme font-semibold mb-1">Task Label</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Clean Temp Logs"
                  required
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                />
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Cron Expression (min hour day month weekday)</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="0 0 * * *"
                  required
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 font-mono text-cyan-400"
                />
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Executable Command</label>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="/usr/bin/find /tmp -type f -mtime +7 -delete"
                  required
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 font-mono text-primary-theme"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-theme hover:bg-hover-theme"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-600"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
