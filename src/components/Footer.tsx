import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <Link to="/" className="text-lg font-bold text-slate-50 hover:text-blue-400">
              Meridian
            </Link>
            <p className="mt-2 text-xs text-slate-400">
              South African public data, made accessible.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-50 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/downloads" className="text-xs text-slate-400 hover:text-slate-200">
                  Downloads
                </Link>
              </li>
              <li>
                <Link to="/dashboards" className="text-xs text-slate-400 hover:text-slate-200">
                  Dashboards
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-xs text-slate-400 hover:text-slate-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-50 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com" className="text-xs text-slate-400 hover:text-slate-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-slate-200">
                  Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-50 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-slate-200">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-slate-200">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <p className="text-xs text-slate-500 text-center">
            © {currentYear} Meridian. All data from official SA government sources.
          </p>
        </div>
      </div>
    </footer>
  )
}
