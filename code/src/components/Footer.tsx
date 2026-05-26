import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-slate-200/50 bg-meridian-beige pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-black tracking-tighter text-slate-950">
              MERIDIAN
            </Link>
            <p className="mt-6 text-[11px] leading-relaxed text-slate-500 max-w-[240px] font-medium">
              National infrastructure for data accessibility and transparency in the Republic of South Africa.
            </p>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/downloads" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Datasets</Link></li>
              <li><Link to="/dashboards" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Analysis</Link></li>
              <li><Link to="/about" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Methodology</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Governance</h3>
            <ul className="space-y-4">
              <li><Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Privacy</Link></li>
              <li><Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Terms</Link></li>
              <li><Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Sovereignty</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Connect</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">LinkedIn</a></li>
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">Contact</a></li>
              <li><a href="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-950">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-32 flex flex-col items-center justify-between border-t border-slate-200/50 pt-10 md:flex-row">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            © {currentYear} MERIDIAN ANALYTICS • PRESERVING TRUTH
          </p>
          <div className="mt-6 flex gap-8 md:mt-0 opacity-20">
            <div className="h-1.5 w-1.5 bg-slate-950"></div>
            <div className="h-1.5 w-1.5 bg-slate-950"></div>
            <div className="h-1.5 w-1.5 bg-slate-950"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
