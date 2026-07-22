import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Shield, Bell, Globe, Users as UsersIcon, Clock, ScrollText, Smartphone, KeyRound, CheckCircle, AlertCircle, Lock } from 'lucide-react';
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

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // 2FA TOTP state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [otpURI, setOtpURI] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('yare_theme') || 'dark';
    setTheme(savedTheme);

    api.get('/settings').then((res) => {
      if (res.data) {
        setTheme(res.data.theme || savedTheme);
        setChannel(res.data.updateChannel || 'stable');
      }
    }).catch(() => {});

    api.get('/auth/me').then((res) => {
      if (res.data) {
        setTwoFactorEnabled(!!res.data.twoFactorEnabled);
      }
    }).catch(() => {});
  }, []);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setIsChangingPwd(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const storedUser = localStorage.getItem('yare_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.mustChangePassword = false;
        localStorage.setItem('yare_user', JSON.stringify(parsed));
      }
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleInitiate2FA = async () => {
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      const res = await api.post('/auth/2fa/setup');
      setTotpSecret(res.data.secret);
      setOtpURI(res.data.otpuri);
      setIsSettingUp2FA(true);
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.error || 'Failed to initialize 2FA');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      await api.post('/auth/2fa/verify', { code: verifyCode });
      setTwoFactorEnabled(true);
      setIsSettingUp2FA(false);
      setVerifyCode('');
      setTwoFactorSuccess('Two-Factor Authentication enabled successfully!');
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.error || 'Invalid verification code');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      await api.post('/auth/2fa/disable', { password: disablePassword, code: disableCode });
      setTwoFactorEnabled(false);
      setIsDisabling2FA(false);
      setDisablePassword('');
      setDisableCode('');
      setTwoFactorSuccess('Two-Factor Authentication has been disabled.');
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.error || 'Failed to disable 2FA');
    }
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
          <p className="text-xs text-muted-theme mt-1">Unified panel configuration, security accounts, password management, cron jobs, alerts, and audit logs.</p>
        </div>

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

          {/* General Preferences */}
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

          {/* Change Account Password Section */}
          <div className="rounded-2xl border border-theme bg-surface-theme p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2 border-b border-theme pb-3">
              <KeyRound className="h-4 w-4 text-cyan-400" /> Account Password Management
            </h3>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> {pwdSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-theme font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Current password"
                    className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                  />
                </div>
                <div>
                  <label className="block text-muted-theme font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                  />
                </div>
                <div>
                  <label className="block text-muted-theme font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {isChangingPwd ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA TOTP) */}
          <div className="rounded-2xl border border-theme bg-surface-theme p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary-theme flex items-center justify-between border-b border-theme pb-3">
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-cyan-400" /> Two-Factor Authentication (TOTP 2FA)
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {twoFactorEnabled ? '2FA Active' : '2FA Disabled'}
              </span>
            </h3>

            {twoFactorError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {twoFactorError}
              </div>
            )}

            {twoFactorSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> {twoFactorSuccess}
              </div>
            )}

            {!twoFactorEnabled && !isSettingUp2FA && (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-secondary-theme">Protect Your Account with Google Authenticator / Authy</p>
                  <p className="text-muted-theme">Require a 6-digit TOTP code in addition to your password during sign in.</p>
                </div>
                <button
                  onClick={handleInitiate2FA}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold transition-all shrink-0"
                >
                  Enable 2FA
                </button>
              </div>
            )}

            {isSettingUp2FA && (
              <div className="space-y-4 border border-cyan-500/20 bg-card-theme p-4 rounded-xl text-xs">
                <p className="font-bold text-cyan-400">Step 1: Scan URI or enter Secret Key in Authenticator App</p>
                <div className="p-3 bg-surface-theme rounded-lg font-mono text-cyan-400 select-all break-all border border-theme">
                  Secret Key: {totpSecret}
                </div>
                <div className="p-2 bg-surface-theme rounded-lg font-mono text-muted-theme text-[11px] select-all break-all border border-theme">
                  OTP URI: {otpURI}
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-3 pt-2">
                  <p className="font-bold text-primary-theme">Step 2: Enter 6-digit Verification Code</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-36 bg-surface-theme border border-theme rounded-xl px-3 py-2 font-mono text-center text-cyan-400 text-sm focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={verifyCode.length !== 6}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold transition-all disabled:opacity-50"
                    >
                      Verify & Activate 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSettingUp2FA(false)}
                      className="px-3 py-2 text-muted-theme hover:text-primary-theme"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {twoFactorEnabled && !isDisabling2FA && (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-400">Two-Factor Authentication is Active</p>
                  <p className="text-muted-theme">Your account is secured with TOTP authenticator protection.</p>
                </div>
                <button
                  onClick={() => setIsDisabling2FA(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all"
                >
                  Disable 2FA
                </button>
              </div>
            )}

            {isDisabling2FA && (
              <form onSubmit={handleDisable2FA} className="space-y-3 border border-rose-500/20 bg-card-theme p-4 rounded-xl text-xs">
                <p className="font-bold text-rose-400">Confirm Disabling 2FA</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Current Password"
                    required
                    className="bg-surface-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-Digit 2FA Code"
                    required
                    className="bg-surface-theme border border-theme rounded-xl px-3 py-2 font-mono text-cyan-400 text-center"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all"
                  >
                    Confirm Disable
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDisabling2FA(false)}
                    className="px-3 py-2 text-muted-theme hover:text-primary-theme"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
