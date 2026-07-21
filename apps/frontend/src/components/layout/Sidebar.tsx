import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Cpu,
  FolderKanban,
  Terminal,
  Activity,
  Box,
  Network,
  ScrollText,
  Users,
  Settings,
  Shield,
  Package,
  Globe,
  Clock,
  Archive,
  Bell,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hostname?: string;
}

export function Sidebar({ activeTab, setActiveTab, hostname = 'yare-server' }: SidebarProps) {
  const { t } = useLanguage();

  const navGroups = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'appstore', label: 'GitHub App Store', icon: Package, highlight: true },
        { id: 'system', label: t('system'), icon: Cpu },
        { id: 'filemanager', label: t('filemanager'), icon: FolderKanban },
        { id: 'terminal', label: t('terminal'), icon: Terminal },
      ]
    },
    {
      title: 'CONTAINERS & SERVERS',
      items: [
        { id: 'docker', label: t('docker'), icon: Box },
        { id: 'services', label: t('services'), icon: Activity },
        { id: 'proxy', label: 'Domain Proxy & SSL', icon: Globe },
      ]
    },
    {
      title: 'MANAGEMENT & SECURITY',
      items: [
        { id: 'cron', label: 'Cron Jobs', icon: Clock },
        { id: 'backups', label: 'Backups', icon: Archive },
        { id: 'alerts', label: 'Alerting', icon: Bell },
        { id: 'network', label: t('network'), icon: Network },
        { id: 'audit', label: 'Security Audit', icon: ShieldCheck },
        { id: 'users', label: t('users'), icon: Users },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800/80 p-3 flex flex-col justify-between h-screen sticky top-0 z-30 font-sans transition-colors">
      <div className="overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-slate-800/80">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-cyan-500/20">
            Y
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              YARE PANEL <span className="text-[10px] font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">v1.2</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Control Center Engine</p>
          </div>
        </div>

        {/* Server Quick Node Status */}
        <div className="mx-1 mb-4 rounded-xl bg-slate-900/80 border border-slate-800/80 px-3 py-2 flex items-center justify-between text-xs shadow-inner">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 text-[11px] truncate">{hostname}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900/40">:8080</span>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-2.5 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">{group.title}</p>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
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
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-3 py-2.5 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between bg-slate-950/90">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-cyan-400" /> Enterprise Panel
        </span>
        <span className="font-mono text-[10px] text-slate-400">v1.2.0</span>
      </div>
    </aside>
  );
}
