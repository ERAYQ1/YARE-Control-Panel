import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PanelUser, SystemUser, SSHKey } from '@yare/types';
import { Users as UsersIcon, Key, UserCheck, Shield, Plus, Lock, Unlock } from 'lucide-react';

export function Users() {
  const [activeTab, setActiveTab] = useState<'panel' | 'linux' | 'ssh'>('panel');
  const [panelUsers, setPanelUsers] = useState<PanelUser[]>([]);
  const [linuxUsers, setLinuxUsers] = useState<SystemUser[]>([]);
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([]);

  useEffect(() => {
    api.get('/users/panel').then((res) => setPanelUsers(res.data)).catch(() => {
      setPanelUsers([
        { id: 'usr_admin', username: 'admin', email: 'admin@yare.local', role: 'admin', twoFactorEnabled: false, createdAt: '2026-07-20 12:00:00' },
        { id: 'usr_op1', username: 'operator1', email: 'op@yare.local', role: 'operator', twoFactorEnabled: true, createdAt: '2026-07-20 14:00:00' }
      ]);
    });
    api.get('/users/linux').then((res) => setLinuxUsers(res.data)).catch(() => {
      setLinuxUsers([
        { username: 'root', uid: 0, gid: 0, homeDir: '/root', shell: '/bin/bash', groups: ['root'], isLocked: false },
        { username: 'yare', uid: 1000, gid: 1000, homeDir: '/home/yare', shell: '/bin/bash', groups: ['yare', 'sudo', 'docker'], isLocked: false }
      ]);
    });
    api.get('/users/ssh-keys').then((res) => setSSHKeys(res.data)).catch(() => {
      setSSHKeys([
        { id: 'ssh-1', name: 'Workstation Laptop (RSA)', fingerprint: 'SHA256:uN89xLkPq2Z...', publicKey: 'ssh-rsa AAAAB3NzaC1yc2E...', addedAt: '2026-07-01' }
      ]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-cyan-400" /> Users & SSH Access Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage panel accounts, Linux system users, groups, and SSH authorized keys.</p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('panel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'panel' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" /> Panel Users
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'linux' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Linux System Users
          </button>
          <button
            onClick={() => setActiveTab('ssh')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'ssh' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5" /> SSH Keys
          </button>
        </div>
      </div>

      {activeTab === 'panel' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">2FA Status</th>
                <th className="py-3 px-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {panelUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{u.username}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{u.twoFactorEnabled ? 'Enabled' : 'Disabled'}</td>
                  <td className="py-3 px-4 text-slate-400">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'linux' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">UID / GID</th>
                <th className="py-3 px-4">Home Directory</th>
                <th className="py-3 px-4">Shell</th>
                <th className="py-3 px-4">Groups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {linuxUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white font-mono">{u.username}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.uid} / {u.gid}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{u.homeDir}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{u.shell}</td>
                  <td className="py-3 px-4 text-slate-400">{u.groups.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ssh' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sshKeys.map((key, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  <Key className="h-4 w-4 text-cyan-400" /> {key.name}
                </span>
                <span className="text-[10px] text-slate-400">{key.addedAt}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{key.fingerprint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
