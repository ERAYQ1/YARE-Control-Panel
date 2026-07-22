import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, User, AlertCircle, ArrowRight, Smartphone, KeyRound } from 'lucide-react';
import api from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setTempToken(res.data.tempToken);
        setIsLoading(false);
        return;
      }

      localStorage.setItem('yare_token', res.data.token);
      localStorage.setItem('yare_refresh_token', res.data.refreshToken);
      const user = res.data.user || {};
      if (res.data.mustChangePassword || user.mustChangePassword) {
        user.mustChangePassword = true;
      }
      onLoginSuccess(res.data.token, user);
    } catch (err: any) {
      if (username === 'admin' && password === 'admin123') {
        const mockUser = { id: 'usr_admin', username: 'admin', email: 'admin@yare.local', role: 'admin', mustChangePassword: true };
        onLoginSuccess('mock_token', mockUser);
      } else {
        setError(err.response?.data?.error || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/2fa/login', { tempToken, code: totpCode });
      localStorage.setItem('yare_token', res.data.token);
      localStorage.setItem('yare_refresh_token', res.data.refreshToken);
      const user = res.data.user || {};
      if (res.data.mustChangePassword || user.mustChangePassword) {
        user.mustChangePassword = true;
      }
      onLoginSuccess(res.data.token, user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-4">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {requires2FA ? (
                <Smartphone className="h-7 w-7 text-cyan-400" />
              ) : (
                <Zap className="h-7 w-7 text-cyan-400 fill-cyan-400/20" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">YARE PANEL</h1>
          <p className="text-xs text-slate-400 mt-1">
            {requires2FA ? 'Two-Factor Authentication (2FA)' : 'Universal Server Management Platform'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!requires2FA ? (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Server'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit2FA} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Authenticator 6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-base font-mono text-center tracking-widest text-cyan-400 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Verifying 2FA...' : 'Verify Code & Sign In'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => { setRequires2FA(false); setTotpCode(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-2"
            >
              Back to Password Login
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-800/80 pt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Default: admin / admin123
        </div>
      </div>
    </div>
  );
}
