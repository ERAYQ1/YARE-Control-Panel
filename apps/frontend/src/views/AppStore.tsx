import React, { useState } from 'react';
import api from '../services/api';
import { Package, Globe, Shield, Download, CheckCircle, ExternalLink, Plus, RefreshCw } from 'lucide-react';

export function AppStore() {
  const [activeTab, setActiveTab] = useState<'store' | 'proxy'>('store');
  const [installingApp, setInstallingApp] = useState<string | null>(null);

  const apps = [
    { id: 'postgres', name: 'PostgreSQL + pgAdmin', category: 'Databases', description: 'Advanced open-source relational database engine with web GUI.', icon: '🗄️', status: 'ready' },
    { id: 'redis', name: 'Redis Cache', category: 'Databases', description: 'Ultra-fast in-memory key-value data structure store.', icon: '⚡', status: 'ready' },
    { id: 'ollama', name: 'Ollama AI Engine', category: 'AI & LLM', description: 'Run Llama 3, Mistral, and local LLMs on your server.', icon: '🤖', status: 'ready' },
    { id: 'n8n', name: 'n8n Workflow Automation', category: 'Automation', description: 'Fair-code workflow automation tool with 400+ integrations.', icon: '🔄', status: 'ready' },
    { id: 'nextcloud', name: 'Nextcloud Hub', category: 'Cloud Storage', description: 'Self-hosted productivity platform and file storage.', icon: '☁️', status: 'ready' },
    { id: 'uptime-kuma', name: 'Uptime Kuma', category: 'Monitoring', description: 'Fancy self-hosted monitoring tool for HTTP, Ping, and TCP.', icon: '📊', status: 'ready' },
  ];

  const [proxyRules, setProxyRules] = useState([
    { domain: 'app.yare.local', targetPort: '8080', ssl: 'Active (Let\'s Encrypt)', status: 'online' },
    { domain: 'db.yare.local', targetPort: '5050', ssl: 'Active (Let\'s Encrypt)', status: 'online' },
  ]);

  const handleInstallApp = (id: string) => {
    setInstallingApp(id);
    setTimeout(() => {
      setInstallingApp(null);
      alert(`App ${id} deployed successfully via Docker Compose!`);
    }, 2000);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#fafafa] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#fafafa]" /> 1-Click App Catalog & Proxy Manager
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">Deploy Docker stacks and manage Nginx/Caddy reverse proxy domains.</p>
        </div>

        <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-md border border-[#27272a]">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'store' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#71717a] hover:text-[#f4f4f5]'
            }`}
          >
            App Store
          </button>
          <button
            onClick={() => setActiveTab('proxy')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'proxy' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#71717a] hover:text-[#f4f4f5]'
            }`}
          >
            Reverse Proxy
          </button>
        </div>
      </div>

      {activeTab === 'store' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div key={app.id} className="rounded-xl border border-[#27272a] bg-[#121215] p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{app.icon}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#18181b] text-[#71717a] border border-[#27272a]">
                    {app.category}
                  </span>
                </div>
                <h3 className="font-bold text-[#fafafa] text-sm">{app.name}</h3>
                <p className="text-xs text-[#71717a] leading-relaxed">{app.description}</p>
              </div>

              <button
                onClick={() => handleInstallApp(app.id)}
                disabled={installingApp === app.id}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#18181b] border border-[#27272a] text-xs font-bold text-[#f4f4f5] hover:bg-[#27272a] transition-colors disabled:opacity-50"
              >
                {installingApp === app.id ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Deploying Stack...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> 1-Click Deploy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#27272a] bg-[#121215] p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#fafafa] uppercase flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#a1a1aa]" /> Nginx / Caddy Proxy Domains
            </h3>
            <button
              onClick={() => {
                const domain = prompt('Enter domain name (e.g. app.mydomain.com):');
                const port = prompt('Enter target port (e.g. 8080):');
                if (domain && port) {
                  setProxyRules([...proxyRules, { domain, targetPort: port, ssl: 'Pending ACME', status: 'online' }]);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] border border-[#27272a] text-xs text-[#f4f4f5] hover:bg-[#27272a]"
            >
              <Plus className="h-3.5 w-3.5" /> Add Proxy Domain
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#a1a1aa]">
            <thead className="border-b border-[#27272a] bg-[#18181b] text-[10px] uppercase text-[#71717a]">
              <tr>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Target Port</th>
                <th className="py-2.5 px-3">SSL Status</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {proxyRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-[#18181b]">
                  <td className="py-2.5 px-3 font-bold text-[#fafafa] flex items-center gap-1.5">
                    {rule.domain} <ExternalLink className="h-3 w-3 text-[#71717a]" />
                  </td>
                  <td className="py-2.5 px-3 text-[#10b981]">{rule.targetPort}</td>
                  <td className="py-2.5 px-3 text-[#a1a1aa]">{rule.ssl}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
