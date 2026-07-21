import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  Terminal,
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
    { id: 'dashboard', label: t('dashboard') || 'Dashboard / Genel Bakış', icon: LayoutDashboard },
    { id: 'appstore', label: 'App Store / Uygulama Mağazası', icon: Package, highlight: true },
    { id: 'filemanager', label: t('filemanager') || 'Dosya Yöneticisi', icon: FolderKanban },
    { id: 'terminal', label: t('terminal') || 'Web Terminal', icon: Terminal },
    { id: 'settings', label: t('settings') || 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar-theme border-r border-theme p-4 flex flex-col justify-between h-screen sticky top-0 z-30 font-sans transition-colors">
      <div className="space-y-6">
        {/* Brand Header (CasaOS Minimalist Style) */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-theme">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-cyan-500/30">
            Y
          </div>
          <div>
            <h1 className="font-black text-base text-primary-theme tracking-tight flex items-center gap-1.5">
              YARE OS <span className="text-[10px] font-bold text-cyan-500 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">v2.0</span>
            </h1>
            <p className="text-[11px] text-muted-theme font-medium">Simple Server OS</p>
          </div>
        </div>

        {/* Server Status Pill */}
        <div className="rounded-xl bg-card-theme border border-theme px-3 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-primary-theme text-xs truncate">{hostname}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-500 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0">ONLINE</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 shadow-sm'
                    : 'text-secondary-theme hover:text-primary-theme hover:bg-hover-theme'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-500' : 'text-muted-theme'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="px-2 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-md bg-cyan-500 text-slate-950">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-3 border-t border-theme text-xs text-muted-theme flex items-center justify-between bg-sidebar-theme rounded-xl">
        <span className="flex items-center gap-2 text-secondary-theme font-semibold text-[11px]">
          <Server className="h-4 w-4 text-cyan-500" /> Host System
        </span>
        <span className="font-mono text-[11px] text-muted-theme font-bold">v2.0.0</span>
      </div>
    </aside>
  );
}
