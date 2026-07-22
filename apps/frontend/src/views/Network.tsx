import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { OpenPort, FirewallRule } from '@yare/types';
import { formatBytes } from '@yare/utils';
import { Network as NetIcon, ShieldCheck, Radio, Lock, Plus, Inbox, X } from 'lucide-react';

export function Network() {
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [ports, setPorts] = useState<OpenPort[]>([]);
  const [firewall, setFirewall] = useState<{ status: string; rules: FirewallRule[] }>({ status: 'active', rules: [] });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRulePort, setNewRulePort] = useState('');
  const [newRuleAction, setNewRuleAction] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [newRuleComment, setNewRuleComment] = useState('');

  useEffect(() => {
    api.get('/network/interfaces').then((res) => setInterfaces(res.data || [])).catch(() => {});
    api.get('/network/ports').then((res) => setPorts(res.data || [])).catch(() => {});
    api.get('/network/firewall').then((res) => setFirewall(res.data || { status: 'active', rules: [] })).catch(() => {});
  }, []);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePort.trim()) return;

    const newRule: FirewallRule = {
      id: `rule_${Date.now()}`,
      action: newRuleAction,
      toPort: newRulePort,
      protocol: 'tcp',
      from: 'Anywhere',
      comment: newRuleComment || 'Added via YARE Control Panel',
    };

    setFirewall((prev) => ({
      ...prev,
      rules: [newRule, ...prev.rules],
    }));

    setShowAddModal(false);
    setNewRulePort('');
    setNewRuleComment('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-primary-theme flex items-center gap-2">
          <NetIcon className="h-6 w-6 text-cyan-400" /> Network Interfaces, Open Ports & UFW Firewall
        </h2>
        <p className="text-xs text-muted-theme mt-1">Monitor network hardware, listening sockets, and manage UFW firewall rules.</p>
      </div>

      {/* Network Interfaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {interfaces.length === 0 ? (
          <div className="col-span-full glass-panel rounded-2xl border border-theme bg-surface-theme p-6 text-center text-muted-theme text-xs">
            <Radio className="mx-auto h-6 w-6 mb-1 opacity-40" />
            <p>No active network interfaces detected.</p>
          </div>
        ) : (
          interfaces.map((iface, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-theme bg-surface-theme p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-theme text-sm font-mono flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-400 animate-pulse" /> {iface.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  UP
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-theme">
                  <span>IP Address</span>
                  <span className="font-mono text-cyan-400 font-semibold">{iface.ipAddress || 'Dynamic / DHCP'}</span>
                </div>
                <div className="flex justify-between text-muted-theme">
                  <span>MAC Address</span>
                  <span className="font-mono text-secondary-theme">{iface.macAddress || '-'}</span>
                </div>
                <div className="flex justify-between text-muted-theme">
                  <span>Rx / Tx</span>
                  <span className="font-mono text-secondary-theme">{formatBytes(iface.rxBytes, 0)} / {formatBytes(iface.txBytes, 0)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Listening Open Ports */}
      <div className="glass-panel rounded-2xl border border-theme bg-surface-theme p-5 space-y-4">
        <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
          <Lock className="h-4 w-4 text-indigo-400" /> Open Listening Ports
        </h3>
        <div className="overflow-x-auto rounded-xl border border-theme bg-card-theme">
          <table className="w-full text-left text-xs text-secondary-theme">
            <thead className="border-b border-theme bg-surface-theme uppercase text-[10px] text-muted-theme">
              <tr>
                <th className="py-2.5 px-4">Port</th>
                <th className="py-2.5 px-4">Protocol</th>
                <th className="py-2.5 px-4">Process Name</th>
                <th className="py-2.5 px-4">PID</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {ports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-theme">
                    <Inbox className="mx-auto h-6 w-6 mb-1 opacity-40" />
                    No open listening ports detected.
                  </td>
                </tr>
              ) : (
                ports.map((p, idx) => (
                  <tr key={idx} className="hover:bg-hover-theme transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">{p.port}</td>
                    <td className="py-2.5 px-4 font-semibold text-secondary-theme">{p.protocol}</td>
                    <td className="py-2.5 px-4 font-medium text-primary-theme">{p.processName}</td>
                    <td className="py-2.5 px-4 font-mono text-muted-theme">{p.pid}</td>
                    <td className="py-2.5 px-4 text-muted-theme">{p.user}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        {p.state}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UFW Firewall Rules */}
      <div className="glass-panel rounded-2xl border border-theme bg-surface-theme p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> UFW Firewall Rules
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-theme bg-card-theme">
          <table className="w-full text-left text-xs text-secondary-theme">
            <thead className="border-b border-theme bg-surface-theme uppercase text-[10px] text-muted-theme">
              <tr>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Port / Protocol</th>
                <th className="py-2.5 px-4">From IP</th>
                <th className="py-2.5 px-4">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {firewall.rules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-theme">
                    <Inbox className="mx-auto h-6 w-6 mb-1 opacity-40" />
                    No firewall rules configured.
                  </td>
                </tr>
              ) : (
                firewall.rules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-hover-theme transition-colors">
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rule.action === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-primary-theme">{rule.toPort}</td>
                    <td className="py-2.5 px-4 font-mono text-muted-theme">{rule.from}</td>
                    <td className="py-2.5 px-4 text-muted-theme">{rule.comment || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Firewall Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-theme border border-theme rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Add Firewall Rule (UFW)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-theme hover:text-primary-theme">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-theme font-semibold mb-1">Port / Protocol</label>
                <input
                  type="text"
                  value={newRulePort}
                  onChange={(e) => setNewRulePort(e.target.value)}
                  placeholder="e.g. 8080/tcp or 443"
                  required
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme font-mono"
                />
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Action</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value as any)}
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                >
                  <option value="ALLOW">ALLOW (Inbound Traffic)</option>
                  <option value="DENY">DENY (Block Traffic)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-theme font-semibold mb-1">Description / Comment</label>
                <input
                  type="text"
                  value={newRuleComment}
                  onChange={(e) => setNewRuleComment(e.target.value)}
                  placeholder="e.g. Web server HTTP port"
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 text-primary-theme"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-theme hover:bg-hover-theme"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-600"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
