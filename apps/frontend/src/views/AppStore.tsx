import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CuratedApp, GitHubRepoItem, InstalledApp } from '@yare/types';
import {
  Package,
  Search,
  Github,
  Download,
  CheckCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Play,
  Square,
  Trash2,
  Terminal,
  Star,
  GitFork,
  Layers,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
  X
} from 'lucide-react';

export function AppStore() {
  const [activeTab, setActiveTab] = useState<'curated' | 'search' | 'import' | 'installed'>('curated');
  
  // Curated Apps State
  const [curatedApps, setCuratedApps] = useState<CuratedApp[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingCurated, setLoadingCurated] = useState<boolean>(true);

  // GitHub Search State
  const [searchQuery, setSearchQuery] = useState<string>('self-hosted');
  const [githubRepos, setGithubRepos] = useState<GitHubRepoItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  // Custom Import State
  const [importRepoUrl, setImportRepoUrl] = useState<string>('');
  const [inspecting, setInspecting] = useState<boolean>(false);

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [loadingInstalled, setLoadingInstalled] = useState<boolean>(false);

  // Modal & Deployment States
  const [selectedDeployApp, setSelectedDeployApp] = useState<{
    name: string;
    repoUrl?: string;
    category?: string;
    description?: string;
    icon?: string;
    dockerImage: string;
    port?: string;
    envVars?: string;
  } | null>(null);

  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployLogs, setDeployLogs] = useState<string>('');

  // Logs Modal State
  const [viewingLogsApp, setViewingLogsApp] = useState<InstalledApp | null>(null);
  const [appLogsContent, setAppLogsContent] = useState<string>('');
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchCuratedApps();
    fetchInstalledApps();
  }, []);

  const fetchCuratedApps = async () => {
    setLoadingCurated(true);
    try {
      const res = await api.get('/appstore/curated');
      setCuratedApps(res.data);
    } catch (err) {
      showToast('Failed to load curated apps catalog', 'error');
    } finally {
      setLoadingCurated(false);
    }
  };

  const fetchInstalledApps = async () => {
    setLoadingInstalled(true);
    try {
      const res = await api.get('/appstore/installed');
      setInstalledApps(res.data);
    } catch (err) {
      // quiet fallback
    } finally {
      setLoadingInstalled(false);
    }
  };

  const handleGitHubSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    try {
      const res = await api.get(`/appstore/github/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.items) {
        setGithubRepos(res.data.items);
      }
    } catch (err) {
      showToast('Failed to query GitHub Search API', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleInspectRepo = async () => {
    if (!importRepoUrl.trim()) return;
    setInspecting(true);
    try {
      const res = await api.post('/appstore/github/inspect', { repoUrl: importRepoUrl });
      const data = res.data;
      setSelectedDeployApp({
        name: data.name,
        repoUrl: data.repoUrl,
        category: 'GitHub Import',
        description: data.description || 'Imported GitHub Repository',
        icon: '📦',
        dockerImage: data.suggestedImage || 'nginx:alpine',
        port: data.suggestedPort || '8080',
        envVars: data.suggestedEnv || 'PORT=8080',
      });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Could not inspect GitHub repository', 'error');
    } finally {
      setInspecting(false);
    }
  };

  const openDeployModal = (app: {
    name: string;
    repoUrl?: string;
    category?: string;
    description?: string;
    icon?: string;
    dockerImage: string;
    port?: string;
    envVars?: string;
  }) => {
    setSelectedDeployApp(app);
    setDeployLogs('');
  };

  const handleConfirmDeploy = async () => {
    if (!selectedDeployApp) return;
    setDeploying(true);
    setDeployLogs('Starting container deployment sequence...\n');

    try {
      const res = await api.post('/appstore/deploy', selectedDeployApp);
      setDeployLogs(prev => prev + (res.data.logs || '') + '\nDeployment Completed Successfully!');
      showToast(`Deployed ${selectedDeployApp.name} successfully!`, 'success');
      fetchInstalledApps();
      setTimeout(() => {
        setSelectedDeployApp(null);
        setActiveTab('installed');
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Deployment failed';
      setDeployLogs(prev => prev + `Error: ${errMsg}\n`);
      showToast(errMsg, 'error');
    } finally {
      setDeploying(false);
    }
  };

  const handleAppAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      await api.post(`/appstore/installed/${id}/${action}`);
      showToast(`Action ${action.toUpperCase()} completed successfully`, 'success');
      fetchInstalledApps();
    } catch (err) {
      showToast(`Failed to execute ${action} on app`, 'error');
    }
  };

  const handleOpenLogs = async (app: InstalledApp) => {
    setViewingLogsApp(app);
    setLoadingLogs(true);
    try {
      const res = await api.get(`/appstore/installed/${app.id}/logs`);
      setAppLogsContent(res.data.logs || 'No logs available.');
    } catch (err) {
      setAppLogsContent('Failed to load container logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const categories = ['All', 'Monitoring', 'Databases', 'Networking', 'Security', 'Storage', 'Automation', 'Search'];

  const filteredCurated = curatedApps.filter(
    app => selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md text-xs font-semibold animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
              : 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="h-5 w-5" />
            </div>
            GitHub App Store & Container Deployer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover open-source GitHub repositories, launch 1-click Docker stacks, and manage self-hosted applications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'curated'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Stacks Catalog
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              if (githubRepos.length === 0) handleGitHubSearch();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="h-3.5 w-3.5" /> GitHub Search
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> Import Repo
          </button>
          <button
            onClick={() => {
              setActiveTab('installed');
              fetchInstalledApps();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative ${
              activeTab === 'installed'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Installed Apps
            {installedApps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                {installedApps.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: CURATED STACKS */}
      {activeTab === 'curated' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingCurated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-4" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCurated.map(app => (
                <div
                  key={app.id}
                  className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-cyan-950/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl p-2 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:scale-105 transition-transform">
                        {app.icon}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Star className="h-3 w-3 fill-amber-400" /> {app.stars.toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {app.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                        {app.name}
                        {app.repoUrl && (
                          <a
                            href={app.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-slate-300 p-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">{app.description}</p>
                    </div>

                    {/* Tag badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openDeployModal({
                        name: app.name,
                        repoUrl: app.repoUrl,
                        category: app.category,
                        description: app.description,
                        icon: app.icon,
                        dockerImage: app.dockerImage,
                        port: app.defaultPort,
                        envVars: app.envVars,
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> 1-Click Deploy Stack
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE GITHUB SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          <form onSubmit={handleGitHubSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search GitHub repos (e.g. topic:self-hosted, docker, monitoring)..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingSearch ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search GitHub
            </button>
          </form>

          {loadingSearch ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {githubRepos.map(repo => (
                <div
                  key={repo.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={repo.owner.avatar_url} alt={repo.owner.login} className="h-7 w-7 rounded-full border border-slate-700" />
                        <div>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-white text-xs hover:text-cyan-400 flex items-center gap-1"
                          >
                            {repo.full_name} <ExternalLink className="h-3 w-3 text-slate-500" />
                          </a>
                          <p className="text-[10px] text-slate-400">By {repo.owner.login}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <GitFork className="h-3 w-3" /> {repo.forks_count}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{repo.description || 'No description provided.'}</p>

                    <div className="flex items-center gap-2 pt-1">
                      {repo.language && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {repo.language}
                        </span>
                      )}
                      {repo.topics && repo.topics.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openDeployModal({
                        name: repo.name,
                        repoUrl: repo.html_url,
                        category: 'GitHub Search',
                        description: repo.description,
                        icon: '📦',
                        dockerImage: `${repo.owner.login}/${repo.name}:latest`,
                        port: '8080',
                        envVars: 'PORT=8080',
                      })
                    }
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Deploy Repo Container
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOM GITHUB IMPORTER */}
      {activeTab === 'import' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Github className="h-5 w-5 text-cyan-400" /> Custom GitHub Repository Deployer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter any public GitHub repository URL to inspect its configuration and spin up a container stack.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">GitHub Repository URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={importRepoUrl}
                onChange={e => setImportRepoUrl(e.target.value)}
                placeholder="https://github.com/louislam/uptime-kuma"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleInspectRepo}
                disabled={inspecting || !importRepoUrl.trim()}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {inspecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Inspect Repo
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Supported formats: `https://github.com/owner/repo` or `owner/repo`</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Automatic Container Auto-Detection
            </p>
            <p>YARE Inspector checks GitHub metadata, release tags, default exposed ports, and generates your deployment manifest automatically.</p>
          </div>
        </div>
      )}

      {/* TAB 4: INSTALLED APPS & CONTAINERS */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" /> Deployed GitHub Applications ({installedApps.length})
            </h3>
            <button
              onClick={fetchInstalledApps}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loadingInstalled ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {installedApps.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <Package className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">No GitHub applications deployed yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the Stacks Catalog or search GitHub to launch your first application stack in seconds.
              </p>
              <button
                onClick={() => setActiveTab('curated')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold text-xs hover:bg-cyan-500"
              >
                Browse Stacks Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installedApps.map(app => (
                <div key={app.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">{app.icon || '📦'}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {app.name}
                          {app.port && (
                            <a
                              href={`http://localhost:${app.port}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 text-xs font-mono hover:underline flex items-center gap-0.5"
                            >
                              :{app.port} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{app.containerName}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        app.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{app.description || 'Deployed GitHub Application Stack'}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenLogs(app)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                    >
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" /> View Logs
                    </button>

                    <div className="flex items-center gap-1.5">
                      {app.status === 'running' ? (
                        <button
                          onClick={() => handleAppAction(app.id, 'stop')}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs"
                          title="Stop Container"
                        >
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAppAction(app.id, 'start')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs"
                          title="Start Container"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleAppAction(app.id, 'restart')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        title="Restart Container"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleAppAction(app.id, 'delete')}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs"
                        title="Uninstall App"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DEPLOYMENT CONFIGURATOR */}
      {selectedDeployApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedDeployApp.icon || '📦'}</span>
                <div>
                  <h3 className="font-bold text-white text-base">Deploy {selectedDeployApp.name}</h3>
                  <p className="text-xs text-slate-400">Configure port mapping and environment variables.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeployApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 uppercase">App Name</label>
                  <input
                    type="text"
                    value={selectedDeployApp.name}
                    onChange={e => setSelectedDeployApp({ ...selectedDeployApp, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase">Exposed Port</label>
                  <input
                    type="text"
                    value={selectedDeployApp.port || ''}
                    onChange={e => setSelectedDeployApp({ ...selectedDeployApp, port: e.target.value })}
                    placeholder="e.g. 8080"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase">Docker Image Target</label>
                <input
                  type="text"
                  value={selectedDeployApp.dockerImage}
                  onChange={e => setSelectedDeployApp({ ...selectedDeployApp, dockerImage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 font-mono mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase">Environment Variables (KEY=VALUE)</label>
                <textarea
                  rows={4}
                  value={selectedDeployApp.envVars || ''}
                  onChange={e => setSelectedDeployApp({ ...selectedDeployApp, envVars: e.target.value })}
                  placeholder="PORT=8080&#10;NODE_ENV=production"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono mt-1"
                />
              </div>

              {deployLogs && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Deployment Console Output</label>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {deployLogs}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedDeployApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeploy}
                disabled={deploying}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-950/30"
              >
                {deploying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Confirm & Launch Stack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTAINER LOGS VIEWER */}
      {viewingLogsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Container Logs: {viewingLogsApp.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingLogsApp.containerName}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLogsApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 h-80 overflow-y-auto font-mono text-xs text-slate-300">
              {loadingLogs ? (
                <div className="flex items-center justify-center h-full gap-2 text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Fetching container telemetry logs...
                </div>
              ) : (
                <pre className="whitespace-pre-wrap leading-relaxed">{appLogsContent}</pre>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewingLogsApp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
