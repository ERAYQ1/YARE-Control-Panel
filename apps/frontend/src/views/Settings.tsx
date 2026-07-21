import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Shield, Bell, Globe, Users as UsersIcon, Clock, ScrollText, Key, Plus, Trash2, RefreshCw } from 'lucide-react';
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
    api.get('/settings').then((res) => {
      if (res.data) {
        setTheme(res.data.theme || 'dark');
        setChannel(res.data.updateChannel || 'stable');
      }
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    api.post('/settings', { theme, updateChannel: channel, sessionTimeout, rateLimiting })
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-cyan-400" /> Platform & Server Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">Unified panel configuration, security accounts, cron jobs, alerts, and audit logs.</p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl border border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'general' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'users' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UsersIcon className="h-3.5 w-3.5" /> Users & SSH
          </button>
          <button
            onClick={() => setActiveTab('cron')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'cron' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Cron Tasks
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'alerts' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="h-3.5 w-3.5" /> Alerting
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" /> Audit Logs
          </button>
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
          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="h-4 w-4 text-cyan-400" /> System Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Color Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                  <option value="system">System Synchronized</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Update Release Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="stable">Stable Release (Recommended)</option>
                  <option value="edge">Edge / Nightly Build</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security & Session Management */}
          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="h-4 w-4 text-indigo-400" /> Security & Session Management
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">API Rate Limiting</p>
                  <p className="text-slate-400">Protect API endpoints against brute-force attacks (100 req/min per IP).</p>
                </div>
                <input
                  type="checkbox"
                  checked={rateLimiting}
                  onChange={(e) => setRateLimiting(e.target.checked)}
                  className="h-4 w-4 accent-cyan-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                <div>
                  <p className="font-bold text-slate-200">Session Expiration (Minutes)</p>
                  <p className="text-slate-400">Automatic JWT token invalidation after inactivity.</p>
                </div>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-mono"
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
