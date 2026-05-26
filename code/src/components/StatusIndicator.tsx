import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  name: string;
  success: boolean;
  lastUpdated: string;
  error?: string | null;
  key?: string;
}

export function StatusIndicator({ name, success, lastUpdated, error }: StatusIndicatorProps) {
  return (
    <div className="flex flex-col bg-transparent border-l border-slate-200/50 pl-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{name}</span>
        <div className={`h-1 w-1 rounded-full ${success ? 'bg-emerald-500' : 'bg-red-500'}`} />
      </div>
      <span className="text-xs font-bold text-slate-950 uppercase tracking-widest mb-2 px-0">
        {success ? 'Operational' : 'Disrupted'}
      </span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Index: {lastUpdated}</span>
      {error && (
        <p className="mt-2 text-[9px] text-red-500 font-medium">Error detected</p>
      )}
    </div>
  );
}
