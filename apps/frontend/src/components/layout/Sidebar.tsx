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
  Puzzle,
  Settings,
  Shield,
  Package,
  Layers,
  Bot,
  Globe,
  Clock,
  Archive,
  Bell,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hostname?: string;
}

export function Sidebar({ activeTab, setActiveTab, hostname = 'yare-server' }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'system', label: t('system'), icon: Cpu },
    { id: 'filemanager', label: t('filemanager'), icon: FolderKanban },
    { id: 'terminal', label: t('terminal'), icon: Terminal },
    { id: 'proxy', label: 'Domain Proxy & SSL', icon: Globe },
    { id: 'cron', label: 'Visual Cron Jobs', icon: Clock },
    { id: 'backups', label: 'Backup & Recovery', icon: Archive },
    { id: 'alerts', label: 'Alerting & Channels', icon: Bell },
    { id: 'audit', label: 'Security Audit Trail', icon: ShieldCheck },
    { id: 'appstore', label: 'App Catalog', icon: Package },
    { id: 'cluster', label: 'Multi-Node Cluster', icon: Layers },
    { id: 'services', label: t('services'), icon: Activity },
    { id: 'docker', label: t('docker'), icon: Box },
    { id: 'network', label: t('network'), icon: Network },
    { id: 'logs', label: t('logs'), icon: ScrollText },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'plugins', label: t('plugins'), icon: Puzzle },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar-theme border-r border-theme p-3 flex flex-col justify-between h-screen sticky top-0 z-30 font-mono transition-colors">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-4 border-b border-theme">
          <div className="h-7 w-7 rounded bg-primary-theme flex items-center justify-center font-black text-xs text-app-theme">
            Y
          </div>
          <div>
            <h1 className="font-bold text-sm text-primary-theme tracking-tight">
              YARE <span className="text-[10px] font-medium text-secondary-theme">v1.0</span>
            </h1>
            <p className="text-[10px] text-muted-theme font-medium">Server Management</p>
          </div>
        </div>

        {/* Server Quick Node Status */}
        <div className="mx-1 mb-3 rounded-lg bg-surface-theme border border-theme px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-primary-theme text-[11px] truncate">{hostname}</span>
          </div>
          <span className="text-[10px] text-muted-theme">:8080</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-card-theme text-primary-theme font-bold border border-theme'
                    : 'text-secondary-theme hover:text-primary-theme bg-hover-theme'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-theme' : 'text-muted-theme'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="px-2 py-2 border-t border-theme text-[11px] text-muted-theme flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-secondary-theme" /> MIT License
        </span>
        <span className="text-secondary-theme">v1.0.0</span>
      </div>
    </aside>
  );
}
