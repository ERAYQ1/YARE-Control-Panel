import React, { useState } from 'react';
import { Server, ShieldCheck, Activity, Plus, RefreshCw, Layers } from 'lucide-react';

export function Cluster() {
  const [nodes, setNodes] = useState([
    { id: 'node-1', name: 'yare-master-node', ip: '192.168.1.120', role: 'Master Control', status: 'online', ping: '1ms', load: '0.45', os: 'Ubuntu 24.04.1 LTS' },
    { id: 'node-2', name: 'hetzner-vps-prod', ip: '135.181.42.89', role: 'Agent Node', status: 'online', ping: '24ms', load: '1.20', os: 'Debian 12 Bookworm' },
    { id: 'node-3', name: 'aws-us-east-worker', ip: '54.210.12.44', role: 'Agent Node', status: 'online', ping: '88ms', load: '0.82', os: 'AlmaLinux 9.4' },
  ]);

  const handleAddNode = () => {
    const name = prompt('Node Name (e.g. digitalocean-sgp):');
    const ip = prompt('Node Public IP Address:');
    if (name && ip) {
      setNodes([...nodes, { id: `node-${nodes.length + 1}`, name, ip, role: 'Agent Node', status: 'online', ping: '35ms', load: '0.15', os: 'Ubuntu 24.04' }]);
    }
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#fafafa] flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#fafafa]" /> YARE Swarm Multi-Node Cluster
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">Manage multiple Linux cloud VPS nodes with mTLS encryption.</p>
        </div>

        <button
          onClick={handleAddNode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] border border-[#27272a] text-xs font-bold text-[#f4f4f5] hover:bg-[#27272a]"
        >
          <Plus className="h-3.5 w-3.5" /> Connect Agent Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="rounded-xl border border-[#27272a] bg-[#121215] p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-[#fafafa]" />
                <span className="font-bold text-[#fafafa] text-xs">{node.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                {node.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#a1a1aa]">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Role</span>
                <span className="font-bold text-[#fafafa]">{node.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">IP Address</span>
                <span className="text-[#10b981]">{node.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">mTLS Ping</span>
                <span>{node.ping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">OS Info</span>
                <span>{node.os}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
