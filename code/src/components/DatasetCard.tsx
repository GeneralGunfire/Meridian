import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface DatasetCardProps {
  category: string;
  title: string;
  source: string;
  description: string;
  format: string;
  refreshRate: string;
  imageUrl: string;
  key?: string;
}

export function DatasetCard({ category, title, source, description, imageUrl }: DatasetCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-transparent"
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-900 mb-8 border border-slate-200/40">
        <img 
          src={imageUrl} 
          alt={title} 
          className="h-full w-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-80 group-hover:grayscale-0"
        />
        <div className="absolute top-6 left-6">
          <span className="rounded-none bg-slate-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white">
            {category}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <h3 className="text-2xl font-bold tracking-tight text-slate-950 mb-2">{title}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Source: {source}</p>
        <p className="text-sm leading-relaxed text-slate-500 mb-8 max-w-[280px]">
          {description}
        </p>
        
        <div className="mt-auto pt-6 border-t border-slate-200/50 flex items-center justify-between">
            <Link to="/downloads" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 hover:opacity-60 transition-opacity">
                Access Data →
            </Link>
        </div>
      </div>
    </motion.div>
  );
}
