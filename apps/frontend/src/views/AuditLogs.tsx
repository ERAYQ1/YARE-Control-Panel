import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, UserCheck, Inbox } from 'lucide-react';
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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/audit-logs?page=${page}&limit=30&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(Array.isArray(data?.logs) ? data.logs : Array.isArray(data) ? data : []);
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error(e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-theme flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {t('audit')}
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Append-only immutable audit log of administrative system actions and logins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-theme absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by user, action, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card-theme border border-theme rounded-xl pl-9 pr-3 py-1.5 text-xs text-primary-theme focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button onClick={fetchLogs} className="p-2 text-muted-theme hover:text-primary-theme bg-card-theme border border-theme rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-surface-theme border border-theme rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-theme font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading audit log records...
          </div>
        ) : safeLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-theme space-y-2">
            <Inbox className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs">No audit log records found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary-theme">
              <thead className="bg-card-theme text-muted-theme uppercase text-[10px] border-b border-theme font-bold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme font-mono">
                {safeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-hover-theme transition text-xs">
                    <td className="px-6 py-3.5 text-muted-theme whitespace-nowrap">{log.created_at}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      {log.username}
                    </td>
                    <td className="px-6 py-3.5 text-cyan-400 font-bold">{log.action}</td>
                    <td className="px-6 py-3.5 text-muted-theme">{log.ip_address}</td>
                    <td className="px-6 py-3.5 text-secondary-theme font-sans">{log.details}</td>
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
