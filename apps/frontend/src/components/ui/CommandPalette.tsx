import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Terminal,
  Package,
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
    { id: 'dashboard', title: 'Dashboard / Genel Bakış', group: 'Core', icon: LayoutDashboard, path: 'Real-time telemetry, load & quick stats' },
    { id: 'appstore', title: 'App Store / Uygulama Mağazası', group: 'Core', icon: Package, path: '1-Click App Catalog & Deployer' },
    { id: 'filemanager', title: 'Dosya Yöneticisi / Files', group: 'Tools', icon: FolderKanban, path: 'Visual file browser & code editor' },
    { id: 'terminal', title: 'Web Terminal / Console', group: 'Tools', icon: Terminal, path: 'Interactive PTY WebSocket shell' },
    { id: 'settings', title: 'Ayarlar / Settings', group: 'System', icon: Settings, path: 'Account security, password & preferences' },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.group.toLowerCase().includes(query.toLowerCase()) ||
    a.path.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 font-sans">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-theme bg-surface-theme shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="relative p-4 border-b border-theme flex items-center">
          <Search className="h-5 w-5 text-muted-theme mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search... (e.g. Dashboard, App Store, Terminal)"
            autoFocus
            className="w-full bg-transparent text-sm text-primary-theme placeholder-muted-theme focus:outline-none font-medium"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-theme hover:text-primary-theme hover:bg-hover-theme">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-theme">No matching section found</div>
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
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-hover-theme transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-theme border border-theme text-cyan-500 group-hover:border-cyan-500/40">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-theme">{item.title}</p>
                      <p className="text-[11px] text-muted-theme">{item.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-theme px-2 py-0.5 rounded bg-card-theme border border-theme">
                      {item.group}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-theme group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcuts */}
        <div className="p-3 bg-card-theme border-t border-theme text-[11px] text-muted-theme flex justify-between items-center px-4 font-mono">
          <span>Navigate with <kbd className="bg-surface-theme px-1.5 py-0.5 rounded border border-theme text-secondary-theme">Ctrl + K</kbd></span>
          <span>Press <kbd className="bg-surface-theme px-1.5 py-0.5 rounded border border-theme text-secondary-theme">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
