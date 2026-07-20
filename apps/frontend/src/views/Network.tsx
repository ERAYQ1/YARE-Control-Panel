import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { OpenPort, FirewallRule } from '@yare/types';
import { formatBytes } from '@yare/utils';
import { Network as NetIcon, ShieldCheck, Radio, Lock, Plus } from 'lucide-react';

export function Network() {
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [ports, setPorts] = useState<OpenPort[]>([]);
  const [firewall, setFirewall] = useState<{ status: string; rules: FirewallRule[] }>({ status: 'active', rules: [] });

  useEffect(() => {
    api.get('/network/interfaces').then((res) => setInterfaces(res.data)).catch(() => {});
    api.get('/network/ports').then((res) => setPorts(res.data)).catch(() => {});
    api.get('/network/firewall').then((res) => setFirewall(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <NetIcon className="h-6 w-6 text-cyan-400" /> Network Interfaces, Open Ports & UFW Firewall
        </h2>
        <p className="text-xs text-slate-400 mt-1">Monitor network hardware, listening sockets, and manage UFW firewall rules.</p>
      </div>

      {/* Network Interfaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {interfaces.map((iface, idx) => (
          <div key={idx} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" /> {iface.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UP
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>IP Address</span>
                <span className="font-mono text-cyan-300 font-semibold">{iface.ipAddress}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MAC Address</span>
                <span className="font-mono text-slate-300">{iface.macAddress}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rx / Tx</span>
                <span className="font-mono text-slate-300">{formatBytes(iface.rxBytes, 0)} / {formatBytes(iface.txBytes, 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Listening Open Ports */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-indigo-400" /> Open Listening Ports
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-2.5 px-4">Port</th>
                <th className="py-2.5 px-4">Protocol</th>
                <th className="py-2.5 px-4">Process Name</th>
                <th className="py-2.5 px-4">PID</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ports.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">{p.port}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-300">{p.protocol}</td>
                  <td className="py-2.5 px-4 font-medium text-white">{p.processName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{p.pid}</td>
                  <td className="py-2.5 px-4 text-slate-400">{p.user}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {p.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UFW Firewall Rules */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> UFW Firewall Rules
          </h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20">
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Port / Protocol</th>
                <th className="py-2.5 px-4">From IP</th>
                <th className="py-2.5 px-4">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {firewall.rules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rule.action === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">{rule.toPort}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{rule.from}</td>
                  <td className="py-2.5 px-4 text-slate-400">{rule.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
