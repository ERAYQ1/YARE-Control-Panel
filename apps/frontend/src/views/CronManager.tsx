import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
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
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            {t('cron')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Schedule automated system commands and scripts effortlessly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            New Scheduled Job
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading scheduled jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No cron jobs configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Job Name</th>
                  <th className="px-6 py-3">Schedule</th>
                  <th className="px-6 py-3">Command</th>
                  <th className="px-6 py-3">Last Run Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4 font-medium text-zinc-100">{j.name}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 text-xs">{j.schedule}</td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs max-w-xs truncate">{j.command}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${
                        j.last_status.includes('success') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {j.last_status || 'Never run'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleRunNow(j.id)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded"
                        title="Run Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(j.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded"
                      >
                        {j.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-zinc-500" />}
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-zinc-100">Add New Scheduled Job</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Job Name</label>
                <input
                  type="text"
                  placeholder="Daily Database Backup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Cron Expression (e.g. 0 0 * * *)</label>
                <input
                  type="text"
                  placeholder="0 0 * * *"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Command / Script</label>
                <input
                  type="text"
                  placeholder="docker exec my_db pg_dumpall > backup.sql"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Save Cron Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
