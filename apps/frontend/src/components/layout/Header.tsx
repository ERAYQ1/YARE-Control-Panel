import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Terminal,
  LogOut,
  ChevronDown,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenTerminal: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  userRole?: string;
  username?: string;
}

export function Header({ onOpenTerminal, onOpenSearch, onLogout, userRole = 'admin', username = 'admin' }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('yare_theme') as 'dark' | 'light') || 'dark';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('yare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: 'TR' },
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
  ] as const;

  return (
    <header className="h-14 bg-sidebar-theme border-b border-theme px-5 flex items-center justify-between sticky top-0 z-20 font-mono transition-colors">
      {/* Search Bar / Quick Command */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="relative min-w-[280px] flex items-center rounded-md border border-theme bg-surface-theme px-3 py-1.5 text-xs text-muted-theme hover:border-border-subtle hover:text-secondary-theme transition-colors text-left"
        >
          <Search className="h-3.5 w-3.5 mr-2 text-muted-theme" />
          <span className="flex-1 text-[11px]">{t('searchPlaceholder')}</span>
          <kbd className="bg-card-theme px-1.5 py-0.5 rounded border border-theme font-mono text-[10px] text-secondary-theme">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 rounded-md border border-theme bg-surface-theme px-2.5 py-1.5 text-xs font-mono font-medium text-secondary-theme hover:bg-card-theme hover:text-primary-theme transition-colors"
          >
            <span>{languages.find((l) => l.code === language)?.flag}</span>
            <ChevronDown className="h-3 w-3 text-muted-theme" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 rounded-md border border-theme bg-surface-theme p-1 shadow-xl z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    language === l.code ? 'bg-card-theme text-primary-theme font-bold' : 'text-secondary-theme hover:bg-hover-theme'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-1.5 rounded-md border border-theme bg-surface-theme px-2.5 py-1.5 text-xs font-medium text-primary-theme hover:bg-card-theme transition-colors"
        >
          <Terminal className="h-3.5 w-3.5 text-secondary-theme" />
          {t('quickTerminal')}
        </button>

        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark Mode"
          className="rounded-md border border-theme bg-surface-theme p-1.5 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="rounded-md border border-theme bg-surface-theme p-1.5 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition-colors relative"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-xl border border-theme bg-surface-theme p-3 shadow-2xl z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-theme pb-2 text-xs font-bold text-primary-theme">
                <span>System Notifications</span>
                <span className="text-[10px] text-cyan-400 font-mono">Live</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-card-theme border border-theme flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-primary-theme text-[11px]">YARE OS Engine Active</p>
                    <p className="text-[10px] text-muted-theme">System telemetry and security monitor operating normally.</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-card-theme border border-theme flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-primary-theme text-[11px]">Automated Cron Scheduler</p>
                    <p className="text-[10px] text-muted-theme">Background worker polling scheduled system tasks.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md border border-theme bg-surface-theme px-2.5 py-1 text-xs font-medium text-primary-theme hover:border-border-subtle transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-card-theme flex items-center justify-center font-mono font-bold text-[10px] text-primary-theme border border-theme">
              {username[0].toUpperCase()}
            </div>
            <span className="font-mono text-xs">{username}</span>
            <ChevronDown className="h-3 w-3 text-muted-theme" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-theme bg-surface-theme p-1 shadow-xl z-50">
              <div className="px-2.5 py-1.5 border-b border-theme text-xs">
                <p className="font-bold text-primary-theme">{username}</p>
                <p className="text-[10px] text-muted-theme font-mono">{userRole}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:bg-hover-theme transition-colors mt-1"
              >
                <LogOut className="h-3.5 w-3.5" /> {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
