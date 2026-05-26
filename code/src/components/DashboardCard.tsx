import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  desc: string;
  link: string;
  key?: string;
}

export function DashboardCard({ title, desc, link }: DashboardCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="flex flex-col bg-transparent"
    >
      <div className="mb-8 h-[240px] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border border-slate-200/40">
          <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                      </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Analysis_Node</span>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-950 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-[280px] leading-relaxed font-medium">
        {desc}
      </p>
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 hover:opacity-60 transition-opacity"
      >
        View Analysis →
      </a>
    </motion.div>
  );
}
