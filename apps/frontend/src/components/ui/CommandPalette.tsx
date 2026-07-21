import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Cpu,
  FolderKanban,
  Terminal,
  Activity,
  Package,
  Archive,
  Settings,
  X,
  ArrowRight,
  Globe,
  Clock,
  Bell,
  Network,
  FileText,
  Users,
  ShieldCheck
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectTab }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'dashboard', title: 'Dashboard / Genel Bakış', group: 'Main', icon: LayoutDashboard, path: 'Real-time telemetry, load & quick stats' },
    { id: 'appstore', title: 'Apps / Uygulamalar', group: 'Main', icon: Package, path: '1-Click App Catalog & GitHub Deployer' },
    { id: 'system', title: 'Sistem Detayları / Specs', group: 'System', icon: Cpu, path: 'Hardware topology, kernel, PCI & USB' },
    { id: 'filemanager', title: 'Dosya Yöneticisi / Files', group: 'System', icon: FolderKanban, path: 'Visual file browser & code editor' },
    { id: 'terminal', title: 'Web Terminal / Console', group: 'System', icon: Terminal, path: 'Interactive PTY WebSocket shell' },
    { id: 'services', title: 'Servis Yöneticisi / Services', group: 'System', icon: Activity, path: 'Systemd daemons start, stop & restart' },
    { id: 'network', title: 'Ağ & Portlar / Network', group: 'System', icon: Network, path: 'Open ports, network interfaces & firewall' },
    { id: 'logs', title: 'Sistem Logları / Logs', group: 'System', icon: FileText, path: 'Journalctl & system log stream' },
    { id: 'proxy', title: 'Ters Proxy & SSL', group: 'Tools', icon: Globe, path: 'Reverse proxy hosts & Nginx exporter' },
    { id: 'cron', title: 'Visual Cron Jobs', group: 'Tools', icon: Clock, path: 'Scheduled cron task manager & logs' },
    { id: 'backups', title: 'Yedekleme & Kurtarma', group: 'Tools', icon: Archive, path: 'Tarball system backups & 1-click restore' },
    { id: 'alerts', title: 'Alarm & Bildirimler', group: 'Tools', icon: Bell, path: 'Telegram, Discord, Slack & Webhook alerts' },
    { id: 'users', title: 'Kullanıcı Yönetimi', group: 'Security', icon: Users, path: 'Panel accounts, Linux users & SSH keys' },
    { id: 'audit', title: 'Güvenlik Logları', group: 'Security', icon: ShieldCheck, path: 'Audit logs & login security history' },
    { id: 'settings', title: 'Ayarlar / Settings', group: 'Security', icon: Settings, path: 'Account security, 2FA & preferences' },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.group.toLowerCase().includes(query.toLowerCase()) ||
    a.path.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4 font-sans">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="relative p-4 border-b border-slate-800 flex items-center">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search section... (e.g. Proxy, Cron, Terminal, Users)"
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching section found</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {item.group}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center px-4 font-mono">
          <span>Navigate with <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Ctrl + K</kbd></span>
          <span>Press <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
