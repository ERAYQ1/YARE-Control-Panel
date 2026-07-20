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
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'system', label: t('system'), icon: Cpu },
    { id: 'filemanager', label: t('filemanager'), icon: FolderKanban },
    { id: 'terminal', label: t('terminal'), icon: Terminal },
    { id: 'services', label: t('services'), icon: Activity },
    { id: 'docker', label: t('docker'), icon: Box },
    { id: 'network', label: t('network'), icon: Network },
    { id: 'logs', label: t('logs'), icon: ScrollText },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'plugins', label: t('plugins'), icon: Puzzle },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-[#09090b] border-r border-[#27272a] p-3 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-4 border-b border-[#27272a]">
          <div className="h-7 w-7 rounded bg-[#fafafa] flex items-center justify-center font-black text-xs text-[#09090b] font-mono">
            Y
          </div>
          <div>
            <h1 className="font-bold text-sm text-[#fafafa] font-mono tracking-tight">
              YARE <span className="text-[10px] font-medium text-[#a1a1aa]">v1.0</span>
            </h1>
            <p className="text-[10px] text-[#71717a] font-medium">Server Management</p>
          </div>
        </div>

        {/* Server Quick Node Status */}
        <div className="mx-1 mb-3 rounded-lg bg-[#121215] border border-[#27272a] px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-[#f4f4f5] text-[11px] truncate font-mono">{hostname}</span>
          </div>
          <span className="text-[10px] text-[#71717a] font-mono">:8080</span>
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
                    ? 'bg-[#27272a] text-[#fafafa]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#fafafa]' : 'text-[#71717a]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="px-2 py-2 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between font-mono">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-[#a1a1aa]" /> MIT License
        </span>
        <span className="text-[#a1a1aa]">v1.0.0</span>
      </div>
    </aside>
  );
}
