import React, { useState, useEffect } from 'react';
import {
  Search,
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
  X,
  ArrowRight
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
    { id: 'dashboard', title: 'Go to Dashboard', group: 'Navigation', icon: LayoutDashboard, path: 'Overview charts & metrics' },
    { id: 'system', title: 'Inspect System Specs', group: 'Navigation', icon: Cpu, path: 'CPU, RAM, Disks, PCI/USB' },
    { id: 'filemanager', title: 'Open File Manager', group: 'Navigation', icon: FolderKanban, path: 'Browse & edit server files' },
    { id: 'terminal', title: 'Open Web Terminal', group: 'Tools', icon: Terminal, path: 'SSH PTY Web Console' },
    { id: 'services', title: 'Manage Systemd Services', group: 'Management', icon: Activity, path: 'Start, stop & restart services' },
    { id: 'docker', title: 'Manage Docker Containers', group: 'Management', icon: Box, path: 'Containers, images, volumes' },
    { id: 'network', title: 'Inspect Network & UFW Firewall', group: 'Security', icon: Network, path: 'IPs, open ports, UFW rules' },
    { id: 'logs', title: 'View Multi-Source Logs', group: 'Monitoring', icon: ScrollText, path: 'System, kernel & docker logs' },
    { id: 'users', title: 'Manage Users & SSH Keys', group: 'Security', icon: Users, path: 'Linux & Panel accounts' },
    { id: 'plugins', title: 'Explore Plugin Marketplace', group: 'Extensions', icon: Puzzle, path: 'Enable or disable modules' },
    { id: 'settings', title: 'Open Platform Settings', group: 'Preferences', icon: Settings, path: 'Security & panel config' },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.group.toLowerCase().includes(query.toLowerCase()) ||
    a.path.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="relative p-4 border-b border-slate-800 flex items-center">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page... (e.g. Terminal, Docker, Logs)"
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching commands found</div>
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

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center px-4 font-mono">
          <span>Navigate with <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Cmd + K</kbd></span>
          <span>Press <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
