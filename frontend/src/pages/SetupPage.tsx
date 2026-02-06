import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';

export function SetupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    api.getSetupStatus().then((status) => {
      if (!status.needsSetup) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addNotification('Error', 'Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      addNotification('Error', 'Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.createOwner(username, password, email);
      if (response.token && response.user) {
        setAuthData(response.token, response.user);
      }
      addNotification('Success', 'Owner account created!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addNotification('Setup Failed', err.response?.data?.error || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center font-bold text-white text-3xl mx-auto">
              B
            </div>
            <h1 className="text-2xl font-bold text-white">Initial Setup</h1>
            <p className="text-sm text-var(--text-muted)">Create your admin account</p>
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
                required
                placeholder="admin"
              />
              <p className="form-hint">This will be your admin username</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="admin@example.com"
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
              <p className="form-hint">Minimum 8 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating account...' : 'Create Owner Account'}
            </button>
          </form>

          {/* Info */}
          <div className="bg-var(--bg-hover) rounded-lg p-3 text-xs text-var(--text-muted) text-center">
            This is a one-time setup. Keep these credentials safe.
          </div>
        </div>
      </div>
    </div>
  );
}
