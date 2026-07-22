import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Plus, X, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
}

export function WebTerminal() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'Terminal #1' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [connected, setConnected] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([
    'Initializing YARE Interactive Terminal Session...',
  ]);
  const [commandInput, setCommandInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const token = localStorage.getItem('yare_token') || '';
    const host = window.location.host || 'localhost:8080';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${host}/api/v1/ws/terminal?token=${encodeURIComponent(token)}`;

    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setOutputLines((prev) => [
          ...prev,
          `\x1b[32m[Connected]\x1b[0m Authenticated WebSocket shell session established.`,
          'root@yare-server:~# '
        ]);
      };

      ws.onmessage = (event) => {
        const text = event.data;
        setOutputLines((prev) => {
          const lines = text.split(/\r?\n/);
          return [...prev, ...lines];
        });
      };

      ws.onerror = () => {
        setConnected(false);
        setOutputLines((prev) => [
          ...prev,
          `[Error] WebSocket connection error or unauthorized token.`,
        ]);
      };

      ws.onclose = () => {
        setConnected(false);
      };
    } catch (err) {
      setConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeTabId]);

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
    setOutputLines(['Reconnecting to terminal WebSocket...']);
    connectWebSocket();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = commandInput;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(cmd + '\n');
      } else {
        // Fallback local echo if WS offline
        if (cmd.trim() === 'clear') {
          setOutputLines(['root@yare-server:~# ']);
        } else {
          setOutputLines((prev) => [
            ...prev,
            `root@yare-server:~# ${cmd}`,
            `[Offline Demo Mode] Connected to YARE Kernel.`,
            'root@yare-server:~# '
          ]);
        }
      }
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
          {connected ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> WebSocket Authenticated
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-500 font-bold">
              <AlertTriangle className="h-3.5 w-3.5" /> Standby / Connecting
            </span>
          )}
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
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {outputLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
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
