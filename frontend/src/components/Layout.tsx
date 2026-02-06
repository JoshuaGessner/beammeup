import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white">
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold tracking-tight"
            aria-label="BeamMeUp home"
          >
            <span className="text-white">Beam</span>
            <span className="text-orange-400">MeUp</span>
          </button>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className={`nav-link ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
              aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/config')}
              className={`nav-link ${location.pathname === '/config' ? 'nav-link-active' : ''}`}
              aria-current={location.pathname === '/config' ? 'page' : undefined}
            >
              Config
            </button>
            <button
              onClick={() => navigate('/mods')}
              className={`nav-link ${location.pathname === '/mods' ? 'nav-link-active' : ''}`}
              aria-current={location.pathname === '/mods' ? 'page' : undefined}
            >
              Mods
            </button>
            {['OWNER', 'ADMIN'].includes(user?.role) && (
              <>
                <button
                  onClick={() => navigate('/users')}
                  className={`nav-link ${location.pathname === '/users' ? 'nav-link-active' : ''}`}
                  aria-current={location.pathname === '/users' ? 'page' : undefined}
                >
                  Users
                </button>
                <button
                  onClick={() => navigate('/audit')}
                  className={`nav-link ${location.pathname === '/audit' ? 'nav-link-active' : ''}`}
                  aria-current={location.pathname === '/audit' ? 'page' : undefined}
                >
                  Audit
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <span className="badge badge-success">{user?.role || 'Viewer'}</span>
            <span className="text-sm text-slate-300">{user?.username}</span>
            <button onClick={handleLogout} className="secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
