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
    <div className="glass-card rounded-lg p-4 transition-all border border-theme bg-card-theme font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase font-bold tracking-wider text-muted-theme">{title}</span>
        <Icon className="h-4 w-4 text-muted-theme" />
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xl font-bold text-primary-theme tracking-tight">{value}</h3>
        {percent !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
            percent > 85 
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
              : 'bg-surface-theme text-secondary-theme border-theme'
          }`}>
            {percent.toFixed(1)}%
          </span>
        )}
      </div>

      {percent !== undefined && (
        <div className="w-full bg-surface-theme rounded-full h-1.5 overflow-hidden mb-2 border border-theme">
          <div
            className="h-full bg-primary-theme rounded-full transition-all duration-500 opacity-80"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}

      {subtitle && <p className="text-[11px] text-muted-theme truncate">{subtitle}</p>}
    </div>
  );
}
