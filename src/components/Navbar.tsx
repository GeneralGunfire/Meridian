import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'

export function Navbar() {
  const location = useLocation()

  const links = [
    { name: 'Downloads', path: '/downloads' },
    { name: 'Dashboards', path: '/dashboards' },
    { name: 'About', path: '/about' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-50 hover:text-blue-400">
          Meridian
        </Link>
        <div className="flex gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === link.path
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
