import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PluginItem } from '@yare/types';
import { Puzzle, ShieldCheck, Globe, CloudUpload, Clock, Power } from 'lucide-react';

export function Plugins() {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);

  useEffect(() => {
    api.get('/plugins').then((res) => setPlugins(res.data)).catch(() => {
      setPlugins([
        { id: 'plugin-fail2ban', name: 'Fail2ban Security Shield', version: '1.2.0', description: 'Monitors authentication logs and automatically blocks malicious brute-force IP addresses.', author: 'YARE Core Team', isEnabled: true, icon: 'ShieldCheck' },
        { id: 'plugin-nginx-vhost', name: 'Nginx VirtualHost Manager', version: '2.0.1', description: 'Manage Nginx reverse proxy domains, SSL Let\'s Encrypt certificates, and location rules.', author: 'YARE Community', isEnabled: true, icon: 'Globe' },
        { id: 'plugin-backup-s3', name: 'S3 Automated Backups', version: '1.0.5', description: 'Scheduled database and directory backups directly to AWS S3, Cloudflare R2, or MinIO.', author: 'YARE Core Team', isEnabled: false, icon: 'CloudUpload' },
        { id: 'plugin-cron-visualizer', name: 'Visual Cron Job Manager', version: '1.1.0', description: 'Create, edit, and visualize scheduled crontab tasks with execution logs.', author: 'YARE Community', isEnabled: true, icon: 'Clock' }
      ]);
    });
  }, []);

  const togglePlugin = (id: string) => {
    setPlugins(plugins.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-cyan-400" /> Modular Plugin Marketplace & Lifecycle Manager
        </h2>
        <p className="text-xs text-slate-400 mt-1">Extend server capabilities with loadable, isolated plugin modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plugins.map((p) => (
          <div key={p.id} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {p.icon === 'ShieldCheck' && <ShieldCheck className="h-5 w-5" />}
                    {p.icon === 'Globe' && <Globe className="h-5 w-5" />}
                    {p.icon === 'CloudUpload' && <CloudUpload className="h-5 w-5" />}
                    {p.icon === 'Clock' && <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <p className="text-[11px] text-slate-400">By {p.author} • v{p.version}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.isEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {p.isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">{p.id}</span>
              <button
                onClick={() => togglePlugin(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  p.isEnabled ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {p.isEnabled ? 'Disable Plugin' : 'Enable Plugin'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
