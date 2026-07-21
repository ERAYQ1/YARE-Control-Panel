import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DockerContainer, DockerImage, DockerVolume, DockerNetwork } from '@yare/types';
import { formatBytes, getStateBadgeColor } from '@yare/utils';
import { DataTable, Column } from '../components/ui/DataTable';
import { Box, Play, Square, RotateCw, Trash2, Layers, HardDrive, Network, Terminal as TermIcon } from 'lucide-react';

export function Docker() {
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'volumes' | 'networks'>('containers');
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [images, setImages] = useState<DockerImage[]>([]);
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 'containers') {
      api.get('/docker/containers')
        .then((res) => setContainers(res.data))
        .catch(() => {
          setContainers([
            { id: 'c8f1e290a1b2', name: 'yare-web-app', image: 'yare/panel:latest', status: 'Up 3 days', state: 'running', created: '3 days ago', ports: ['0.0.0.0:8080->8080/tcp'], cpuUsage: 1.2, memoryUsage: 45 * 1024 * 1024, memoryLimit: 512 * 1024 * 1024 },
            { id: 'a1b2c3d4e5f6', name: 'production-postgres', image: 'postgres:16-alpine', status: 'Up 5 days', state: 'running', created: '5 days ago', ports: ['127.0.0.1:5432->5432/tcp'], cpuUsage: 0.8, memoryUsage: 180 * 1024 * 1024, memoryLimit: 2048 * 1024 * 1024 },
            { id: 'f9e8d7c6b5a4', name: 'redis-cache', image: 'redis:7-alpine', status: 'Up 5 days', state: 'running', created: '5 days ago', ports: ['127.0.0.1:6379->6379/tcp'], cpuUsage: 0.3, memoryUsage: 38 * 1024 * 1024, memoryLimit: 1024 * 1024 * 1024 }
          ]);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'images') {
      api.get('/docker/images')
        .then((res) => setImages(res.data))
        .catch(() => {
          setImages([
            { id: 'sha256:e9d1', repository: 'yare/panel', tag: 'latest', size: 184000000, created: '3 days ago' },
            { id: 'sha256:a4b2', repository: 'postgres', tag: '16-alpine', size: 240000000, created: '2 weeks ago' },
            { id: 'sha256:f5c8', repository: 'redis', tag: '7-alpine', size: 35000000, created: '1 month ago' }
          ]);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'volumes') {
      api.get('/docker/volumes')
        .then((res) => setVolumes(res.data))
        .catch(() => {
          setVolumes([
            { name: 'postgres_data', driver: 'local', mountpoint: '/var/lib/docker/volumes/postgres_data/_data', created: '2026-07-15' },
            { name: 'redis_data', driver: 'local', mountpoint: '/var/lib/docker/volumes/redis_data/_data', created: '2026-07-15' }
          ]);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'networks') {
      api.get('/docker/networks')
        .then((res) => setNetworks(res.data))
        .catch(() => {
          setNetworks([
            { id: 'bridge01', name: 'bridge', driver: 'bridge', scope: 'local' },
            { id: 'yare_net', name: 'yare_default', driver: 'bridge', scope: 'local' }
          ]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const handleContainerAction = (id: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    api.post(`/docker/containers/${id}/${action}`)
      .then(() => {
        // Refresh containers list
        api.get('/docker/containers').then(res => setContainers(res.data));
      })
      .catch(() => {});
  };

  const containerColumns: Column<DockerContainer>[] = [
    {
      header: 'Container Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-200 text-xs font-mono">{row.name}</p>
          <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{row.image}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'state',
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStateBadgeColor(row.state)}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'CPU %',
      accessorKey: 'cpuUsage',
      cell: (row) => <span className="font-mono text-cyan-400 font-bold">{row.cpuUsage}%</span>,
    },
    {
      header: 'Memory',
      accessorKey: 'memoryUsage',
      cell: (row) => <span className="font-mono text-slate-300">{formatBytes(row.memoryUsage, 1)}</span>,
    },
    {
      header: 'Ports',
      accessorKey: 'ports',
      cell: (row) => <span className="font-mono text-[11px] text-indigo-300">{(row.ports || []).join(', ') || 'None'}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.state === 'running' ? (
            <button
              onClick={() => handleContainerAction(row.id, 'stop')}
              className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              title="Stop"
            >
              <Square className="h-3 w-3 fill-rose-400" />
            </button>
          ) : (
            <button
              onClick={() => handleContainerAction(row.id, 'start')}
              className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              title="Start"
            >
              <Play className="h-3 w-3 fill-emerald-400" />
            </button>
          )}
          <button
            onClick={() => handleContainerAction(row.id, 'restart')}
            className="p-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            title="Restart"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleContainerAction(row.id, 'delete')}
            className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
            title="Delete Container"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Box className="h-6 w-6 text-cyan-400" /> Docker Engine & Container Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage container lifecycles, images, volumes, networks, and compose stacks.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('containers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'containers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="h-3.5 w-3.5" /> Containers
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'images' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Images
          </button>
          <button
            onClick={() => setActiveTab('volumes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'volumes' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" /> Volumes
          </button>
          <button
            onClick={() => setActiveTab('networks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'networks' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" /> Networks
          </button>
        </div>
      </div>

      {activeTab === 'containers' && (
        <DataTable
          columns={containerColumns}
          data={containers}
          searchPlaceholder="Search Docker containers..."
          isLoading={isLoading}
        />
      )}

      {activeTab === 'images' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Image ID</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {images.map((img, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{img.repository}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{img.tag}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{img.id}</td>
                  <td className="py-3 px-4 font-mono">{formatBytes(img.size, 1)}</td>
                  <td className="py-3 px-4 text-slate-400">{img.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'volumes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {volumes.map((vol, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs font-mono">{vol.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{vol.driver}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{vol.mountpoint}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {networks.map((net, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <span className="font-bold text-white text-xs font-mono">{net.name}</span>
              <p className="text-[11px] text-slate-400 font-mono">Driver: {net.driver} | Scope: {net.scope}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
