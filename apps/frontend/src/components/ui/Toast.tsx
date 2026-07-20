import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-rose-500/30 bg-rose-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    info: 'border-cyan-500/30 bg-cyan-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto glass-panel rounded-2xl border p-4 shadow-2xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-4 ${borders[toast.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">{toast.title}</h4>
            {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>}
          </div>
          <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-white p-0.5">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
