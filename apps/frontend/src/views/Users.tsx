import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PanelUser, SystemUser, SSHKey } from '@yare/types';
import { Users as UsersIcon, Key, UserCheck, Shield, RefreshCw } from 'lucide-react';

export function Users() {
  const [activeTab, setActiveTab] = useState<'panel' | 'linux' | 'ssh'>('panel');
  const [panelUsers, setPanelUsers] = useState<PanelUser[]>([]);
  const [linuxUsers, setLinuxUsers] = useState<SystemUser[]>([]);
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/users/panel')
        .then(res => setPanelUsers(Array.isArray(res.data) ? res.data : res.data?.users || []))
        .catch(() => setPanelUsers([])),
      api.get('/users/linux')
        .then(res => setLinuxUsers(Array.isArray(res.data) ? res.data : res.data?.users || []))
        .catch(() => setLinuxUsers([])),
      api.get('/users/ssh-keys')
        .then(res => setSSHKeys(Array.isArray(res.data) ? res.data : res.data?.keys || []))
        .catch(() => setSSHKeys([]))
    ]).finally(() => setLoading(false));
  };

  const safePanelUsers = Array.isArray(panelUsers) ? panelUsers : [];
  const safeLinuxUsers = Array.isArray(linuxUsers) ? linuxUsers : [];
  const safeSSHKeys = Array.isArray(sshKeys) ? sshKeys : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary-theme flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-cyan-400" /> System Accounts & SSH Access
          </h2>
          <p className="text-xs text-muted-theme mt-1">Manage panel accounts, Linux system users, groups, and SSH authorized keys.</p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-theme bg-card-theme">
          <button
            onClick={() => setActiveTab('panel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'panel' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-muted-theme hover:text-primary-theme'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" /> Panel Accounts ({safePanelUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'linux' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-muted-theme hover:text-primary-theme'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Linux System Users ({safeLinuxUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('ssh')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'ssh' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-muted-theme hover:text-primary-theme'
            }`}
          >
            <Key className="h-3.5 w-3.5" /> Authorized SSH Keys ({safeSSHKeys.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-theme flex items-center justify-center gap-2 font-mono text-xs">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" /> Querying system accounts telemetry...
        </div>
      ) : (
        <>
          {activeTab === 'panel' && (
            <div className="rounded-2xl border border-theme bg-surface-theme overflow-hidden">
              {safePanelUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-theme text-xs font-mono">No panel user accounts found in database.</div>
              ) : (
                <table className="w-full text-left text-xs text-secondary-theme">
                  <thead className="border-b border-theme bg-card-theme uppercase text-[10px] text-muted-theme">
                    <tr>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">2FA Status</th>
                      <th className="py-3 px-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {safePanelUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-hover-theme">
                        <td className="py-3 px-4 font-bold text-primary-theme">{u.username}</td>
                        <td className="py-3 px-4 text-muted-theme">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/20">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-theme">{u.twoFactorEnabled ? 'Enabled' : 'Disabled'}</td>
                        <td className="py-3 px-4 text-muted-theme">{u.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'linux' && (
            <div className="rounded-2xl border border-theme bg-surface-theme overflow-hidden">
              {safeLinuxUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-theme text-xs font-mono">No Linux system users enumerated.</div>
              ) : (
                <table className="w-full text-left text-xs text-secondary-theme">
                  <thead className="border-b border-theme bg-card-theme uppercase text-[10px] text-muted-theme">
                    <tr>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">UID / GID</th>
                      <th className="py-3 px-4">Home Directory</th>
                      <th className="py-3 px-4">Shell</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme font-mono">
                    {safeLinuxUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-hover-theme">
                        <td className="py-3 px-4 font-bold text-primary-theme">{u.username}</td>
                        <td className="py-3 px-4 text-muted-theme">{u.uid} / {u.gid}</td>
                        <td className="py-3 px-4 text-secondary-theme">{u.homeDir}</td>
                        <td className="py-3 px-4 text-cyan-400">{u.shell}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            u.isLocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {u.isLocked ? 'Locked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'ssh' && (
            <div className="rounded-2xl border border-theme bg-surface-theme overflow-hidden">
              {safeSSHKeys.length === 0 ? (
                <div className="p-8 text-center text-muted-theme text-xs font-mono">No authorized SSH keys configured.</div>
              ) : (
                <table className="w-full text-left text-xs text-secondary-theme">
                  <thead className="border-b border-theme bg-card-theme uppercase text-[10px] text-muted-theme">
                    <tr>
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">Fingerprint</th>
                      <th className="py-3 px-4">Added Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme font-mono">
                    {safeSSHKeys.map((k, idx) => (
                      <tr key={idx} className="hover:bg-hover-theme">
                        <td className="py-3 px-4 font-bold text-primary-theme">{k.name}</td>
                        <td className="py-3 px-4 text-cyan-400 text-[11px] truncate max-w-xs">{k.fingerprint}</td>
                        <td className="py-3 px-4 text-muted-theme">{k.addedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
