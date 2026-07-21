import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Cpu,
  FolderKanban,
  Terminal,
  Activity,
  Package,
  Archive,
  Settings,
  Server
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hostname?: string;
}

export function Sidebar({ activeTab, setActiveTab, hostname = 'yare-server' }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
    { id: 'appstore', label: 'Apps / Uygulamalar', icon: Package, highlight: true },
    { id: 'system', label: t('system') || 'Sistem', icon: Cpu },
    { id: 'filemanager', label: t('filemanager') || 'Dosyalar', icon: FolderKanban },
    { id: 'terminal', label: t('terminal') || 'Terminal', icon: Terminal },
    { id: 'services', label: t('services') || 'Servisler', icon: Activity },
    { id: 'backups', label: 'Yedekleme', icon: Archive },
    { id: 'settings', label: t('settings') || 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800/80 p-3 flex flex-col justify-between h-screen sticky top-0 z-30 font-sans transition-colors">
      <div className="overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-slate-800/80">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-base text-white shadow-lg shadow-cyan-500/25">
            Y
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              YARE PANEL <span className="text-[10px] font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">v2.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Linux Server Management</p>
          </div>
        </div>

        {/* Server Quick Node Status */}
        <div className="mx-1 mb-5 rounded-xl bg-slate-900/80 border border-slate-800/80 px-3 py-2.5 flex items-center justify-between text-xs shadow-inner">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 text-[11px] truncate">{hostname}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900/40">:8080</span>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-2.5 mb-2 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">MAIN MENU</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-3 py-2.5 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between bg-slate-950/90">
        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Server className="h-3.5 w-3.5 text-cyan-400" /> Host Engine
        </span>
        <span className="font-mono text-[10px] text-slate-400">v2.0.0</span>
      </div>
    </aside>
  );
}
