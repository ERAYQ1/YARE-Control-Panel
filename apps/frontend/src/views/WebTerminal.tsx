import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Plus, X, Maximize2, RefreshCw } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
}

export function WebTerminal() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'Terminal #1' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const terminalRef = useRef<HTMLDivElement>(null);
  const [outputLines, setOutputLines] = useState<string[]>([
    'Welcome to YARE Web Terminal (Ubuntu 24.04.1 LTS x86_64)',
    'Type "help" or "status" for interactive commands.',
    '',
    'yare@server-node-1:~$ '
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.trim();
      let response = '';

      if (cmd === 'clear') {
        setOutputLines(['yare@server-node-1:~$ ']);
        setCommandInput('');
        return;
      } else if (cmd === 'help') {
        response = 'YARE Terminal Commands:\r\n  status      - Display system metrics\r\n  uname -a    - Kernel information\r\n  docker ps   - List docker containers\r\n  clear       - Clear screen';
      } else if (cmd === 'status') {
        response = 'YARE Daemon: Online | CPU: 12.5% | RAM: 6.2GB / 16.0GB | Uptime: 3d 14h 22m';
      } else if (cmd === 'uname -a') {
        response = 'Linux yare-server-node-1 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
      } else if (cmd === 'docker ps') {
        response = 'CONTAINER ID   IMAGE                COMMAND                  STATUS\r\nc8f1e290a1b2   yare/panel:latest   "./yare-backend"        Up 3 days\r\na1b2c3d4e5f6   postgres:16-alpine   "docker-entrypoint.s…"   Up 5 days';
      } else if (cmd !== '') {
        response = `yare-sh: command executed: ${cmd}`;
      }

      setOutputLines((prev) => [
        ...prev.slice(0, -1),
        `yare@server-node-1:~$ ${cmd}`,
        ...(response ? [response] : []),
        'yare@server-node-1:~$ '
      ]);
      setCommandInput('');
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Tab Bar */}
      <div className="flex items-center justify-between glass-panel rounded-2xl border border-slate-800 bg-slate-950 p-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTabId === tab.id
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <X
                  className="h-3 w-3 hover:text-rose-400 transition-colors"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                />
              )}
            </button>
          ))}
          <button
            onClick={handleAddTab}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition-all"
            title="New Terminal Tab"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => setOutputLines(['Welcome to YARE Web Terminal', '', 'yare@server-node-1:~$ '])}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            title="Reconnect / Reset"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen Container */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 bg-slate-950/95 p-4 font-mono text-xs text-emerald-400 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-1">
          {outputLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line}</div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-900 mt-4">
          <span className="text-cyan-400 font-bold">yare@server-node-1:~$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none"
            placeholder="Type command here..."
          />
        </div>
      </div>
    </div>
  );
}
