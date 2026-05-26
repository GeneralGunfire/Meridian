import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Datasets', path: '/downloads' },
    { name: 'Analysis', path: '/dashboards' },
    { name: 'Methodology', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-meridian-beige/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-16">
          <Link to="/" className="text-xl font-black tracking-tighter text-slate-950">
            MERIDIAN
          </Link>
          <div className="hidden md:flex md:gap-10">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-slate-950",
                  location.pathname === link.path ? "text-slate-950" : "text-slate-500"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
