import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Shield, Bell, Globe, Users as UsersIcon, Clock, ScrollText, RefreshCw } from 'lucide-react';
import { Users } from './Users';
import { CronManagerView } from './CronManager';
import { AlertManagerView } from './AlertManager';
import { AuditLogsView } from './AuditLogs';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'cron' | 'alerts' | 'audit'>('general');
  const [theme, setTheme] = useState('dark');
  const [channel, setChannel] = useState('stable');
  const [sessionTimeout, setSessionTimeout] = useState('1440');
  const [rateLimiting, setRateLimiting] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Read persisted theme from localStorage on mount
    const savedTheme = localStorage.getItem('yare_theme') || 'dark';
    setTheme(savedTheme);

    api.get('/settings').then((res) => {
      if (res.data) {
        const serverTheme = res.data.theme || savedTheme;
        setTheme(serverTheme);
        setChannel(res.data.updateChannel || 'stable');
      }
    }).catch(() => {});
  }, []);

  // Live theme switching: apply theme class to <html> whenever it changes
  const applyTheme = (newTheme: string) => {
    const resolved = newTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme;
    document.documentElement.className = resolved;
    localStorage.setItem('yare_theme', newTheme);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSave = () => {
    api.post('/settings', { theme, updateChannel: channel, sessionTimeout, rateLimiting })
      .then(() => {
        setSavedSuccess(true);
        applyTheme(theme);
        setTimeout(() => setSavedSuccess(false), 3000);
      });
  };

  const subTabs = [
    { id: 'general' as const, label: 'General', icon: Globe },
    { id: 'users' as const, label: 'Users & SSH', icon: UsersIcon },
    { id: 'cron' as const, label: 'Cron Tasks', icon: Clock },
    { id: 'alerts' as const, label: 'Alerting', icon: Bell },
    { id: 'audit' as const, label: 'Audit Logs', icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary-theme flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-cyan-400" /> Platform & Server Settings
          </h2>
          <p className="text-xs text-muted-theme mt-1">Unified panel configuration, security accounts, cron jobs, alerts, and audit logs.</p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-theme bg-card-theme">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-muted-theme hover:text-primary-theme'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6 max-w-4xl">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Settings saved successfully!
            </div>
          )}

          {/* General Settings */}
          <div className="rounded-2xl border border-theme bg-surface-theme p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2 border-b border-theme pb-3">
              <Globe className="h-4 w-4 text-cyan-400" /> System Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-theme font-semibold mb-1">Color Theme</label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                  <option value="system">System Synchronized</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Update Release Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                >
                  <option value="stable">Stable Release (Recommended)</option>
                  <option value="edge">Edge / Nightly Build</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security & Session Management */}
          <div className="rounded-2xl border border-theme bg-surface-theme p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2 border-b border-theme pb-3">
              <Shield className="h-4 w-4 text-indigo-400" /> Security & Session Management
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-secondary-theme">API Rate Limiting</p>
                  <p className="text-muted-theme">Protect API endpoints against brute-force attacks (100 req/min per IP).</p>
                </div>
                <input
                  type="checkbox"
                  checked={rateLimiting}
                  onChange={(e) => setRateLimiting(e.target.checked)}
                  className="h-4 w-4 accent-cyan-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between border-t border-theme pt-3">
                <div>
                  <p className="font-bold text-secondary-theme">Session Expiration (Minutes)</p>
                  <p className="text-muted-theme">Automatic JWT token invalidation after inactivity.</p>
                </div>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-24 bg-card-theme border border-theme rounded-xl px-3 py-1.5 text-primary-theme font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 hover:opacity-95"
            >
              <Save className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && <Users />}
      {activeTab === 'cron' && <CronManagerView />}
      {activeTab === 'alerts' && <AlertManagerView />}
      {activeTab === 'audit' && <AuditLogsView />}
    </div>
  );
}
