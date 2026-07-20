/**
 * Formats bytes to human-readable binary file sizes (e.g. 1.5 GB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${val} ${sizes[i]}`;
}

/**
 * Formats seconds into human-readable uptime (e.g. 3d 14h 22m).
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}

/**
 * Format network speed (bytes per sec to MB/s, KB/s, etc.)
 */
export function formatNetworkSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
}

/**
 * Truncates text with ellipsis if longer than max length.
 */
export function truncateString(str: string, maxLength = 30): string {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

/**
 * Color badge picker based on state
 */
export function getStateBadgeColor(state: string): string {
  const s = state.toLowerCase();
  if (['active', 'running', 'allow', 'online', 'info'].includes(s)) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (['warn', 'warning', 'exited', 'restarting'].includes(s)) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  if (['failed', 'error', 'deny', 'reject', 'stopped', 'offline'].includes(s)) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}
