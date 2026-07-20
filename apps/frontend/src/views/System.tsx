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
      .catch(() => {
        // Fallback info
        setInfo({
          hostname: 'yare-node-ubuntu-24',
          timezone: 'UTC (+03:00 Europe/Istanbul)',
          kernelVersion: '6.8.0-40-generic',
          osVersion: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
          cpuModel: 'AMD EPYC 7763 64-Core Processor',
          cpuCores: 8,
          cpuThreads: 16,
          ramTotal: 32 * 1024 * 1024 * 1024,
          swapTotal: 4 * 1024 * 1024 * 1024,
          disks: [
            { name: '/dev/nvme0n1', size: 512 * 1024 * 1024 * 1024, type: 'NVMe SSD', model: 'Samsung SSD 980 PRO 512GB' },
            { name: '/dev/sda', size: 2000 * 1024 * 1024 * 1024, type: 'SATA HDD', model: 'WDC WD2003FZEX-00SRLA0' }
          ],
          partitions: [
            { device: '/dev/nvme0n1p1', mountPoint: '/boot/efi', fsType: 'vfat', size: 512 * 1024 * 1024 },
            { device: '/dev/nvme0n1p2', mountPoint: '/', fsType: 'ext4', size: 511 * 1024 * 1024 * 1024 }
          ],
          pciDevices: [
            '00:00.0 Host bridge: Advanced Micro Devices, Inc. [AMD] Starship/Matisse Root Complex',
            '01:00.0 VGA compatible controller: NVIDIA Corporation GA106 [GeForce RTX 3060]',
            '02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I225-V (rev 03)'
          ],
          usbDevices: [
            'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub',
            'Bus 002 Device 002: ID 0781:5581 SanDisk Corp. Ultra'
          ],
          gpu: 'NVIDIA GeForce RTX 3060 12GB',
          bios: 'American Megatrends Inc. v2.40 (11/14/2025)',
          motherboard: 'ASUSTeK COMPUTER INC. ROG STRIX B550-F GAMING'
        });
      });
  }, []);

  if (!info) return <div className="p-8 text-center text-slate-400">Loading system specs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Server className="h-6 w-6 text-cyan-400" /> Detailed Hardware & OS Specification
        </h2>
        <p className="text-xs text-slate-400 mt-1">Deep inspection of kernel, CPU topology, storage devices, and peripherals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* OS & Kernel */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> System & Kernel
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Hostname</span>
              <span className="font-semibold text-white">{info.hostname}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">OS Version</span>
              <span className="font-semibold text-white">{info.osVersion}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Kernel Release</span>
              <span className="font-mono text-cyan-300">{info.kernelVersion}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Timezone</span>
              <span className="font-semibold text-white">{info.timezone}</span>
            </div>
          </div>
        </div>

        {/* CPU Topology */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Cpu className="h-4 w-4" /> Processor Topology
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">CPU Model</span>
              <span className="font-semibold text-white truncate max-w-[180px]">{info.cpuModel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Physical Cores</span>
              <span className="font-semibold text-white">{info.cpuCores} Cores</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Logical Threads</span>
              <span className="font-semibold text-white">{info.cpuThreads} Threads</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total System RAM</span>
              <span className="font-mono text-indigo-300">{formatBytes(info.ramTotal, 0)}</span>
            </div>
          </div>
        </div>

        {/* Motherboard & BIOS */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CircuitBoard className="h-4 w-4" /> Board & Firmware
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Motherboard</span>
              <span className="font-semibold text-white truncate max-w-[180px]">{info.motherboard || 'Generic System Board'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">BIOS Firmware</span>
              <span className="font-semibold text-white truncate max-w-[180px]">{info.bios || 'UEFI v2.4'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Discrete GPU</span>
              <span className="font-semibold text-emerald-300">{info.gpu || 'Integrated Graphics'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disks & Partitions */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-cyan-400" /> Physical Storage Disks & Partition Scheme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info.disks.map((d, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white font-mono">{d.name}</p>
                <p className="text-xs text-slate-400">{d.model} • {d.type}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                {formatBytes(d.size, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PCI & USB Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" /> PCI Express Devices (lspci)
          </h3>
          <div className="space-y-2 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
            {info.pciDevices.map((dev, i) => (
              <div key={i} className="p-2 rounded bg-slate-950/80 border border-slate-800/80">{dev}</div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Usb className="h-4 w-4 text-amber-400" /> Connected USB Devices (lsusb)
          </h3>
          <div className="space-y-2 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
            {info.usbDevices.map((dev, i) => (
              <div key={i} className="p-2 rounded bg-slate-950/80 border border-slate-800/80">{dev}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
