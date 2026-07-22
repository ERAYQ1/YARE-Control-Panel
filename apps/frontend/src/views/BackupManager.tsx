import React, { useState, useEffect } from 'react';
import { Archive, Plus, Trash2, Download, RefreshCw, HardDrive, Inbox, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BackupItem {
  id: string;
  name: string;
  backup_type: string;
  target_path: string;
  storage_type: string;
  schedule: string;
  last_run: string;
  created_at: string;
  size_bytes: number;
}

export const BackupManagerView: React.FC = () => {
  const { t } = useLanguage();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [backupType, setBackupType] = useState('full');
  const [sourceDir, setSourceDir] = useState('/opt/yare');

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBackups(Array.isArray(data?.backups) ? data.backups : Array.isArray(data) ? data : []);
      } else {
        setBackups([]);
      }
    } catch (e) {
      console.error(e);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/backups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, backup_type: backupType, source_dir: sourceDir })
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        fetchBackups();
      } else {
        alert('Failed to create backup');
      }
    } catch (e) {
      alert('Error initiating backup');
    }
  };

  const handleDownload = (id: string) => {
    const token = localStorage.getItem('yare_token');
    window.open(`/api/v1/backups/${id}/download?token=${token}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete backup file permanently?')) return;
    try {
      const token = localStorage.getItem('yare_token');
      await fetch(`/api/v1/backups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBackups();
    } catch (e) {
      console.error(e);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const safeBackups = Array.isArray(backups) ? backups : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-theme flex items-center gap-2">
            <Archive className="w-6 h-6 text-cyan-400" />
            {t('backups')}
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Automated database & application directory backups with local storage tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBackups}
            className="p-2 text-muted-theme hover:text-primary-theme bg-card-theme border border-theme rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Create Backup Snapshot
          </button>
        </div>
      </div>

      <div className="bg-surface-theme border border-theme rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-theme font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Fetching backup archives...
          </div>
        ) : safeBackups.length === 0 ? (
          <div className="p-12 text-center text-muted-theme space-y-2">
            <Inbox className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs">No backup snapshots found in storage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary-theme">
              <thead className="bg-card-theme text-muted-theme uppercase text-[10px] border-b border-theme font-bold">
                <tr>
                  <th className="px-4 py-3">Snapshot Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Source Directory</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme font-mono">
                {safeBackups.map((b) => (
                  <tr key={b.id} className="hover:bg-hover-theme transition">
                    <td className="px-4 py-3 font-bold text-primary-theme flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      {b.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {b.backup_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-theme">{b.target_path}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{formatSize(b.size_bytes)}</td>
                    <td className="px-4 py-3 text-muted-theme">{b.created_at}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownload(b.id)}
                          className="p-1.5 rounded-lg bg-card-theme hover:bg-hover-theme text-cyan-400 border border-theme"
                          title="Download Snapshot"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                          title="Delete Snapshot"
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

      {/* Modal: Create Backup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-theme border border-theme rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <Archive className="w-4 h-4 text-cyan-400" /> Create Backup Snapshot
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-theme hover:text-primary-theme">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBackup} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-theme font-semibold mb-1">Snapshot Label</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily DB Backup"
                  required
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                />
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Backup Scope</label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                >
                  <option value="full">Full Backup (System + DB + Config)</option>
                  <option value="database">Database Only (SQLite Snapshot)</option>
                  <option value="files">Filesystem Directory Only</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Target Directory Path</label>
                <input
                  type="text"
                  value={sourceDir}
                  onChange={(e) => setSourceDir(e.target.value)}
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
                  Start Backup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
