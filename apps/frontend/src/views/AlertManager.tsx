import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Channel {
  id: string;
  name: string;
  channel_type: string;
  config_json: string;
  enabled: boolean;
}

interface Rule {
  id: string;
  metric: string;
  condition: string;
  threshold: number;
  channel_id: string;
}

export const AlertManagerView: React.FC = () => {
  const { t } = useLanguage();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [name, setName] = useState('');
  const [channelType, setChannelType] = useState('telegram');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('yare_token');
      const [chRes, rRes] = await Promise.all([
        fetch('/api/v1/alerts/channels', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/alerts/rules', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const chData = await chRes.json();
      const rData = await rRes.json();
      if (chRes.ok) setChannels(chData.channels || []);
      if (rRes.ok) setRules(rData.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    let configJSON = '{}';
    if (channelType === 'telegram') {
      configJSON = JSON.stringify({ bot_token: botToken, chat_id: chatId });
    } else {
      configJSON = JSON.stringify({ webhook_url: webhookUrl });
    }

    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch('/api/v1/alerts/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, channel_type: channelType, config_json: configJSON })
      });
      if (res.ok) {
        setShowAddChannel(false);
        setName('');
        fetchData();
      }
    } catch (e) {
      alert('Failed to save alert channel');
    }
  };

  const handleTestChannel = async (id: string) => {
    try {
      const token = localStorage.getItem('yare_token');
      const res = await fetch(`/api/v1/alerts/channels/${id}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) alert('Test alert sent!');
      else alert(data.error || 'Failed to send test alert');
    } catch (e) {
      alert('Error testing channel');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Delete alert channel?')) return;
    try {
      const token = localStorage.getItem('yare_token');
      await fetch(`/api/v1/alerts/channels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            {t('alerts')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure Telegram, Discord, Slack, and Webhook alerts for system health events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddChannel(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Notification Channel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Notification Channels
          </h2>
          {channels.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">No notification channels added.</div>
          ) : (
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm text-zinc-200">{ch.name}</h3>
                    <span className="text-xs font-mono text-emerald-400 uppercase">{ch.channel_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestChannel(ch.id)}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded"
                      title="Send Test Alert"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(ch.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Active Threshold Rules
          </h2>
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg space-y-2 text-sm text-zinc-300">
            <div className="flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-800 pb-2">
              <span>Metric Efficacy</span>
              <span>Threshold</span>
            </div>
            <div className="flex justify-between items-center">
              <span>CPU Utilization High</span>
              <span className="font-mono text-emerald-400">&gt; 90%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>RAM Memory Exhaustion</span>
              <span className="font-mono text-emerald-400">&gt; 85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Disk Space Critical</span>
              <span className="font-mono text-emerald-400">&gt; 90%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Docker Container Exited</span>
              <span className="font-mono text-red-400">Dead / Stopped</span>
            </div>
          </div>
        </div>
      </div>

      {showAddChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-zinc-100">Add Notification Channel</h2>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Channel Name</label>
                <input
                  type="text"
                  placeholder="DevOps Telegram Alert Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Channel Type</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                >
                  <option value="telegram">Telegram Bot</option>
                  <option value="discord">Discord Webhook</option>
                  <option value="slack">Slack Webhook</option>
                  <option value="webhook">Custom Webhook</option>
                </select>
              </div>
              {channelType === 'telegram' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Bot Token</label>
                    <input
                      type="text"
                      placeholder="123456789:ABCdefGhI..."
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Chat ID</label>
                    <input
                      type="text"
                      placeholder="-100123456789"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Webhook URL</label>
                  <input
                    type="text"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChannel(false)}
                  className="px-4 py-2 text-sm text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
