import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadStatus = async () => {
    try {
      setError('');
      const data = await api.getServerStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load status');
    }
  };

  const loadLogs = async () => {
    try {
      setError('');
      setLogsLoading(true);
      const data = await api.getServerLogs(200);
      setLogs(data.logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadLogs();
    setLoading(false);

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    if (!window.confirm('Are you sure you want to restart the server?')) {
      return;
    }

    setRestarting(true);
    try {
      setError('');
      await api.restartServer();
      setSuccess('Server restart initiated');
      setTimeout(() => loadStatus(), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restart server');
    } finally {
      setRestarting(false);
    }
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) return <Layout><div className="panel px-6 py-4">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-400">Live status and quick actions</p>
          </div>
        </div>

        {error && <div className="bg-red-600/80 text-white p-3 rounded">{error}</div>}
        {success && <div className="bg-emerald-600/80 text-white p-3 rounded">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="panel p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Server Status</h2>
              <span className={`badge ${status?.running ? 'badge-success' : 'badge-danger'}`}>
                {status?.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">State</p>
                <p className="text-lg font-semibold text-white">
                  {status?.running ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Uptime</p>
                <p className="text-lg font-semibold text-white">{formatUptime(status?.uptime)}</p>
              </div>
            </div>
            {['OWNER', 'ADMIN', 'OPERATOR'].includes(user?.role) && (
              <button
                onClick={handleRestart}
                disabled={restarting}
                className="w-full danger mt-2 disabled:opacity-50"
              >
                {restarting ? 'Restarting...' : 'Restart Server'}
              </button>
            )}
          </div>

          <div className="panel p-6 space-y-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/config')}
                className="w-full primary justify-between"
              >
                Edit Configuration
                <span className="text-sm">⚙️</span>
              </button>
              <button
                onClick={() => navigate('/mods')}
                className="w-full secondary justify-between"
              >
                Manage Mods
                <span className="text-sm">📦</span>
              </button>
            </div>
          </div>
        </div>

        <div className="panel p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Recent Logs</h2>
            <button
              onClick={loadLogs}
              disabled={logsLoading}
              className="secondary text-sm disabled:opacity-50"
            >
              {logsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm text-slate-300">
            {logs ? (
              logs.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">
                  {line}
                </div>
              ))
            ) : (
              <p className="text-slate-500">No logs available</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
