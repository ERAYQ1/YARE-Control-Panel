import React, { useState } from 'react';
import { Terminal as TerminalIcon, Plus, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
}

export function WebTerminal() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'Terminal #1' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [connected, setConnected] = useState(true);
  const [outputLines, setOutputLines] = useState<string[]>([
    'Linux yare-server 6.8.0-40-generic #40-Debian SMP PREEMPT_DYNAMIC x86_64',
    'YARE Interactive PTY WebSocket Shell Console initialized.',
    'Type "help", "status", "df", "free", or "clear" to execute commands.',
    '',
    'root@yare-server:~# '
  ]);
  const [commandInput, setCommandInput] = useState('');

  const handleAddTab = () => {
    const nextId = `tab-${tabs.length + 1}`;
    setTabs([...tabs, { id: nextId, title: `Terminal #${tabs.length + 1}` }]);
    setActiveTabId(nextId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) setActiveTabId(filtered[0].id);
  };

  const handleReconnect = () => {
    setConnected(false);
    setTimeout(() => {
      setConnected(true);
      setOutputLines([
        'Linux yare-server 6.8.0-40-generic #40-Debian SMP PREEMPT_DYNAMIC x86_64',
        'WebSocket reconnected successfully.',
        '',
        'root@yare-server:~# '
      ]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.trim();
      let response = '';

      if (cmd === 'clear') {
        setOutputLines(['root@yare-server:~# ']);
        setCommandInput('');
        return;
      } else if (cmd === 'help') {
        response = 'YARE Terminal Help:\r\n  status      - Display system telemetry\r\n  df -h       - Disk usage\r\n  free -m     - Memory usage\r\n  uname -a    - Kernel details\r\n  clear       - Clear console screen';
      } else if (cmd === 'status') {
        response = 'YARE OS Daemon: Online | CPU: 14.2% | RAM: 1.4GB / 3.8GB | Host: Linux Debian 13';
      } else if (cmd === 'df' || cmd === 'df -h') {
        response = 'Filesystem      Size  Used Avail Use% Mounted on\r\n/dev/sda1        40G   11G   27G  29% /';
      } else if (cmd === 'free' || cmd === 'free -m') {
        response = '               total        used        free      shared  buff/cache   available\r\nMem:            3840        1420        1280          12        1140        2380';
      } else if (cmd === 'uname -a') {
        response = 'Linux yare-server 6.8.0-40-generic #40-Debian SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
      } else if (cmd !== '') {
        response = `bash: ${cmd}: command executed successfully`;
      }

      setOutputLines((prev) => [
        ...prev.slice(0, -1),
        `root@yare-server:~# ${cmd}`,
        ...(response ? [response] : []),
        'root@yare-server:~# '
      ]);
      setCommandInput('');
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)] font-sans">
      {/* Tab Bar */}
      <div className="flex items-center justify-between glass-panel rounded-2xl border border-theme bg-surface-theme p-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTabId === tab.id
                  ? 'bg-card-theme text-cyan-500 border border-theme shadow-sm'
                  : 'text-muted-theme hover:text-primary-theme'
              }`}
            >
              <TerminalIcon className="h-3.5 w-3.5 text-cyan-500" />
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <X
                  className="h-3 w-3 hover:text-rose-500 transition-colors ml-1"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                />
              )}
            </button>
          ))}
          <button
            onClick={handleAddTab}
            className="p-1.5 text-muted-theme hover:text-cyan-500 rounded-xl hover:bg-hover-theme transition-all"
            title="New Terminal Tab"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> WebSocket Active
          </span>
          <button
            onClick={handleReconnect}
            className="p-1.5 text-muted-theme hover:text-primary-theme rounded-xl hover:bg-hover-theme transition-all"
            title="Reconnect Session"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${!connected ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal Screen Container */}
      <div className="flex-1 glass-panel rounded-2xl border border-theme bg-slate-950 p-5 font-mono text-xs text-emerald-400 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-1">
          {outputLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line}</div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-900 mt-4">
          <span className="text-cyan-400 font-bold shrink-0">root@yare-server:~#</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none"
            placeholder="Type command here (e.g. status, df -h, free -m)..."
          />
        </div>
      </div>
    </div>
  );
}
