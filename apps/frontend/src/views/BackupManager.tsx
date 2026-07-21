import React, { useState, useEffect } from 'react';
import { Archive, Plus, Trash2, Download, RefreshCw, HardDrive } from 'lucide-react';
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
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.error(e);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Archive className="w-6 h-6 text-emerald-400" />
            {t('backups')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create compressed system snapshots and automated scheduled backups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBackups}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Instant Backup
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading backups...</div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <HardDrive className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No backups generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Backup Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Target Path</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4 font-medium text-zinc-100">{b.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-emerald-400 border border-zinc-700">
                        {b.backup_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs">{b.target_path}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{formatSize(b.size_bytes)}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{b.created_at}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDownload(b.id)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded"
                        title="Download Backup Tar.gz"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
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
            <h2 className="text-lg font-bold text-zinc-100">Create New System Backup</h2>
            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Backup Name</label>
                <input
                  type="text"
                  placeholder="System_Full_Snapshot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Backup Type</label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                >
                  <option value="full">Full YARE System & DB</option>
                  <option value="db">SQLite Database Only</option>
                  <option value="files">Custom Directory</option>
                </select>
              </div>
              {backupType === 'files' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Directory Path</label>
                  <input
                    type="text"
                    value={sourceDir}
                    onChange={(e) => setSourceDir(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
              )}
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
