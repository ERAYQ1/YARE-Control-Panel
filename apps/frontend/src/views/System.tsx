import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SystemDetailedInfo } from '@yare/types';
import { formatBytes } from '@yare/utils';
import { Cpu, HardDrive, Server, Usb, CircuitBoard, ShieldCheck, Database } from 'lucide-react';

export function System() {
  const [info, setInfo] = useState<SystemDetailedInfo | null>(null);

  useEffect(() => {
    api.get('/system/info')
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null));
  }, []);

  if (!info) return <div className="p-8 text-center text-muted-theme font-mono text-xs">Loading system specs...</div>;

  return (
    <div className="space-y-6 font-sans transition-colors duration-200">
      <div>
        <h2 className="text-xl font-extrabold text-primary-theme flex items-center gap-2">
          <Server className="h-6 w-6 text-cyan-500" /> Detailed Hardware & OS Specification
        </h2>
        <p className="text-xs text-muted-theme mt-1">Deep inspection of host kernel, CPU topology, storage devices, and peripherals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* OS & Kernel */}
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> System & Kernel
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">Hostname</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right">{info.hostname}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">OS Version</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right">{info.osVersion}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">Kernel Release</span>
              <span className="font-mono text-cyan-500 truncate max-w-[60%] text-right">{info.kernelVersion}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 min-w-0">
              <span className="text-muted-theme shrink-0">Timezone</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right">{info.timezone}</span>
            </div>
          </div>
        </div>

        {/* CPU Topology */}
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
            <Cpu className="h-4 w-4" /> Processor Topology
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">CPU Model</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right" title={info.cpuModel}>{info.cpuModel}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">Physical Cores</span>
              <span className="font-semibold text-primary-theme text-right">{info.cpuCores} Cores</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">Logical Threads</span>
              <span className="font-semibold text-primary-theme text-right">{info.cpuThreads} Threads</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 min-w-0">
              <span className="text-muted-theme shrink-0">Total Host RAM</span>
              <span className="font-mono text-indigo-500 text-right">{formatBytes(info.ramTotal, 0)}</span>
            </div>
          </div>
        </div>

        {/* Motherboard & BIOS */}
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
            <CircuitBoard className="h-4 w-4" /> Board & Firmware
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">Motherboard</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right" title={info.motherboard}>{info.motherboard || 'Generic System Board'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme min-w-0">
              <span className="text-muted-theme shrink-0">BIOS Firmware</span>
              <span className="font-semibold text-primary-theme truncate max-w-[60%] text-right" title={info.bios}>{info.bios || 'UEFI v2.4'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1.5 min-w-0">
              <span className="text-muted-theme shrink-0">Discrete GPU</span>
              <span className="font-semibold text-emerald-500 truncate max-w-[60%] text-right" title={info.gpu}>{info.gpu || 'Integrated Graphics'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disks & Partitions */}
      <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-cyan-500" /> Physical Storage Disks & Partition Scheme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(info.disks || []).map((d, i) => (
            <div key={i} className="p-4 rounded-xl bg-card-theme border border-theme flex items-center justify-between min-w-0">
              <div className="min-w-0 pr-2">
                <p className="text-sm font-bold text-primary-theme font-mono truncate">{d.name}</p>
                <p className="text-xs text-muted-theme truncate">{d.model} • {d.type}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-mono shrink-0">
                {formatBytes(d.used || 0, 0)} / {formatBytes(d.size, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PCI & USB Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-500" /> PCI Express Devices (lspci)
          </h3>
          <div className="space-y-2 font-mono text-[11px] text-secondary-theme max-h-48 overflow-y-auto">
            {(info.pciDevices || []).length > 0 ? (
              info.pciDevices.map((dev, i) => (
                <div key={i} className="p-2 rounded bg-card-theme border border-theme break-all">{dev}</div>
              ))
            ) : (
              <div className="p-3 text-muted-theme text-center italic">No PCI devices enumerated</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-theme bg-surface-theme p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <Usb className="h-4 w-4 text-amber-500" /> Connected USB Devices (lsusb)
          </h3>
          <div className="space-y-2 font-mono text-[11px] text-secondary-theme max-h-48 overflow-y-auto">
            {(info.usbDevices || []).length > 0 ? (
              info.usbDevices.map((dev, i) => (
                <div key={i} className="p-2 rounded bg-card-theme border border-theme break-all">{dev}</div>
              ))
            ) : (
              <div className="p-3 text-muted-theme text-center italic">No USB devices enumerated</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
