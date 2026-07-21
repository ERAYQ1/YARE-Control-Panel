import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Shield, ShieldCheck, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProxyHost {
  id: string;
  domain: string;
  target_url: string;
  ssl_enabled: boolean;
  ssl_auto: boolean;
  created_at: string;
}

export const ProxyManagerView: React.FC = () => {
  const { t } = useLanguage();
  const [hosts, setHosts] = useState<ProxyHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState('');
  const [domain, setDomain] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sslAuto, setSslAuto] = useState(true);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/proxy/hosts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHosts(data.hosts || []);
      }
    } catch (e) {
      console.error('Failed to fetch proxy hosts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/proxy/hosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ domain, target_url: targetUrl, ssl_auto: sslAuto })
      });
      if (res.ok) {
        setShowAddModal(false);
        setDomain('');
        setTargetUrl('');
        fetchHosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add proxy host');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDeleteHost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this domain proxy host?')) return;
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/proxy/hosts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchHosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSSL = async (id: string) => {
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/proxy/hosts/${id}/ssl`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchHosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportConfig = async (id: string) => {
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/proxy/hosts/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExportConfig(data.config);
        setShowExportModal(data.domain);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            {t('proxy')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Route public domains to local ports & Docker containers with 1-click Let's Encrypt SSL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHosts}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Domain Proxy
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading domain proxy hosts...</div>
        ) : hosts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No proxy domains configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Target URL</th>
                  <th className="px-6 py-3">SSL Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {hosts.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4 font-mono font-medium text-emerald-400 flex items-center gap-2">
                      <a href={`http://${h.domain}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        {h.domain}
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400">{h.target_url}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleSSL(h.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          h.ssl_enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {h.ssl_enabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {h.ssl_enabled ? 'HTTPS Active' : 'HTTP Only'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{h.created_at}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleExportConfig(h.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 rounded hover:bg-zinc-800 transition"
                        title="Export Nginx Config"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHost(h.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20 transition"
                        title="Delete Proxy Host"
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
            <h2 className="text-lg font-bold text-zinc-100">Add Domain Proxy</h2>
            <form onSubmit={handleCreateHost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Domain Name</label>
                <input
                  type="text"
                  placeholder="app.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Target URL / Port</label>
                <input
                  type="text"
                  placeholder="http://127.0.0.1:3000"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sslAuto"
                  checked={sslAuto}
                  onChange={(e) => setSslAuto(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="sslAuto" className="text-xs text-zinc-300">Auto-request Let's Encrypt SSL certificate</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Save Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-zinc-100">Nginx Config for {showExportModal}</h2>
            <textarea
              readOnly
              value={exportConfig}
              className="w-full h-64 font-mono text-xs bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-lg p-3 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowExportModal(null)}
                className="px-4 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
