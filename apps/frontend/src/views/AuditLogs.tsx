import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AuditLogItem {
  id: string;
  username: string;
  action: string;
  ip_address: string;
  details: string;
  created_at: string;
}

export const AuditLogsView: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/audit-logs?page=${page}&limit=30&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {t('audit')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Append-only immutable audit log of administrative system actions and logins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by user, action, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button onClick={fetchLogs} className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No audit log records found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition text-xs">
                    <td className="px-6 py-3.5 font-mono text-zinc-400 whitespace-nowrap">{log.created_at}</td>
                    <td className="px-6 py-3.5 font-medium text-emerald-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      {log.username}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-zinc-200">{log.action}</td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">{log.ip_address}</td>
                    <td className="px-6 py-3.5 font-mono text-zinc-400 max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
