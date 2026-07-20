import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  percent?: number;
  accentColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  percent,
}: StatCardProps) {
  return (
    <div className="glass-card rounded-lg p-4 transition-colors border border-[#27272a] bg-[#121215]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#71717a]">{title}</span>
        <Icon className="h-4 w-4 text-[#71717a]" />
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xl font-bold font-mono text-[#fafafa] tracking-tight">{value}</h3>
        {percent !== undefined && (
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
            percent > 85 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
              : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a]'
          }`}>
            {percent.toFixed(1)}%
          </span>
        )}
      </div>

      {percent !== undefined && (
        <div className="w-full bg-[#18181b] rounded-full h-1.5 overflow-hidden mb-2 border border-[#27272a]">
          <div
            className="h-full bg-[#fafafa] rounded-full transition-all duration-500 opacity-80"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}

      {subtitle && <p className="text-[11px] text-[#71717a] font-mono truncate">{subtitle}</p>}
    </div>
  );
}
