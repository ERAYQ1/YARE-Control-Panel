import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Terminal,
  LogOut,
  ChevronDown
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: 'TR' },
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
  ] as const;

  return (
    <header className="h-14 bg-[#09090b] border-b border-[#27272a] px-5 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar / Quick Command */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="relative min-w-[280px] flex items-center rounded-md border border-[#27272a] bg-[#121215] px-3 py-1.5 text-xs text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa] transition-colors text-left"
        >
          <Search className="h-3.5 w-3.5 mr-2 text-[#71717a]" />
          <span className="flex-1 text-[11px]">{t('searchPlaceholder')}</span>
          <kbd className="bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a] font-mono text-[10px] text-[#a1a1aa]">
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
            className="flex items-center gap-1.5 rounded-md border border-[#27272a] bg-[#121215] px-2.5 py-1.5 text-xs font-mono font-medium text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#f4f4f5] transition-colors"
          >
            <span>{languages.find((l) => l.code === language)?.flag}</span>
            <ChevronDown className="h-3 w-3 text-[#71717a]" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 rounded-md border border-[#27272a] bg-[#121215] p-1 shadow-xl z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    language === l.code ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b]'
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
          className="flex items-center gap-1.5 rounded-md border border-[#27272a] bg-[#121215] px-2.5 py-1.5 text-xs font-medium text-[#f4f4f5] hover:bg-[#18181b] transition-colors"
        >
          <Terminal className="h-3.5 w-3.5 text-[#a1a1aa]" />
          {t('quickTerminal')}
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-md border border-[#27272a] bg-[#121215] p-1.5 text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-[#a1a1aa]" /> : <Moon className="h-4 w-4 text-[#a1a1aa]" />}
        </button>

        <button className="rounded-md border border-[#27272a] bg-[#121215] p-1.5 text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* User Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md border border-[#27272a] bg-[#121215] px-2.5 py-1 text-xs font-medium text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-[#27272a] flex items-center justify-center font-mono font-bold text-[10px] text-[#fafafa]">
              {username[0].toUpperCase()}
            </div>
            <span className="font-mono text-xs">{username}</span>
            <ChevronDown className="h-3 w-3 text-[#71717a]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-[#27272a] bg-[#121215] p-1 shadow-xl z-50">
              <div className="px-2.5 py-1.5 border-b border-[#27272a] text-xs">
                <p className="font-bold text-[#fafafa]">{username}</p>
                <p className="text-[10px] text-[#71717a] font-mono">{userRole}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-[#18181b] transition-colors mt-1"
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
