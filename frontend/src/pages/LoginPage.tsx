import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    api.getSetupStatus()
      .then((status) => {
        if (status.needsSetup) {
          navigate('/setup');
        }
      })
      .catch((err) => {
        console.error('Failed to check setup status:', err);
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      addNotification('Welcome back!', `Signed in as ${username}`, 'success');
      // Force page reload to ensure session cookie is properly loaded
      window.location.href = '/dashboard';
    } catch (err: any) {
      addNotification('Login Failed', err.response?.data?.error || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card-lg space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center font-bold text-white text-3xl mx-auto">
              B
            </div>
            <h1 className="text-2xl font-bold text-white">BeamMeUp</h1>
            <p className="text-sm text-muted">BeamMP Server Administration</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                required
                placeholder="admin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted">
              Secure server management dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
