import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative flex flex-col items-start justify-center px-6 py-32 lg:px-8 lg:py-48 bg-meridian-beige">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl"
      >
        <div className="flex items-center gap-3 mb-10">
            <div className="h-[1px] w-12 bg-slate-200"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">National Data Infrastructure</span>
        </div>
        
        <h1 className="text-6xl font-bold tracking-tight text-slate-950 sm:text-8xl mb-10 leading-[0.95]">
          South African Data,<br /> 
          Redefined for Precision.
        </h1>
        
        <p className="max-w-xl text-lg leading-relaxed text-slate-500 mb-14 font-medium">
          Automated scraping of 128+ core datasets from official portals. 
          Normalized and research-ready.
        </p>
        
        <div>
          <Link to="/downloads" className="inline-flex items-center justify-center gap-3 rounded-sm bg-slate-950 px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 active:scale-[0.98]">
            Explore The Catalog
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
