import React, { useState } from 'react';
import { Bot, Terminal, ShieldAlert, Sparkles, CheckCircle2, Play } from 'lucide-react';

export function AICopilot() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am YARE Copilot. I analyze logs, detect anomalies, and help generate safe terminal commands.' }
  ]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');

    setTimeout(() => {
      let reply = `Suggested Command: sudo du -sh /var/log/* | sort -rh | head -n 5\r\nExplanation: This command scans /var/log directory for the 5 largest log files consuming disk space.`;
      if (userMsg.toLowerCase().includes('docker')) {
        reply = `Suggested Command: docker system prune -af --volumes\r\nExplanation: Safely removes stopped containers, unused networks, and dangling image caches.`;
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 1000);
  };

  return (
    <div className="space-y-5 font-mono">
      <div>
        <h2 className="text-base font-bold text-[#fafafa] flex items-center gap-2">
          <Bot className="h-5 w-5 text-[#fafafa]" /> YARE AI Diagnostics & Copilot
        </h2>
        <p className="text-xs text-[#71717a] mt-0.5">Natural language server diagnostics and automated anomaly detection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-[#27272a] bg-[#121215] p-4 flex flex-col justify-between h-[450px]">
          <div className="space-y-3 overflow-y-auto pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-3 rounded-lg text-xs ${m.role === 'user' ? 'bg-[#27272a] text-[#fafafa] ml-8' : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] mr-8'}`}>
                <p className="font-bold mb-1 text-[#fafafa] flex items-center gap-1.5">
                  {m.role === 'user' ? 'You' : <><Sparkles className="h-3 w-3 text-[#10b981]" /> YARE Copilot</>}
                </p>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#27272a] mt-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot (e.g. How do I clear disk space or check memory leaks?)..."
              className="flex-1 bg-[#18181b] border border-[#27272a] rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none"
            />
            <button onClick={handleSend} className="px-3 py-2 bg-[#27272a] text-xs font-bold text-[#fafafa] rounded hover:bg-[#3f3f46]">
              Send
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#121215] p-4 space-y-3">
          <h3 className="text-xs font-bold text-[#fafafa] uppercase flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#10b981]" /> Automated Self-Healing Playbooks
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] space-y-1">
              <p className="font-bold text-[#fafafa]">Auto Disk Prune</p>
              <p className="text-[11px] text-[#71717a]">Runs Docker system prune when disk space hits 90%.</p>
              <span className="text-[10px] text-emerald-400 font-bold">STATUS: ENABLED</span>
            </div>
            <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] space-y-1">
              <p className="font-bold text-[#fafafa]">Brute-Force IP Ban</p>
              <p className="text-[11px] text-[#71717a]">Blocks IPs exceeding 5 failed SSH logins within 1 min.</p>
              <span className="text-[10px] text-emerald-400 font-bold">STATUS: ENABLED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
