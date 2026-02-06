import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function AuditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!['OWNER', 'ADMIN'].includes(user?.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    api
      .getAuditLogs()
      .then((data) => setLogs(data.logs))
      .catch(() => addNotification('Error', 'Failed to load audit logs', 'error'))
      .finally(() => setLoading(false));
  }, [addNotification]);

  const handleExport = async () => {
    try {
      const csv = await api.exportAuditLogs();
      const url = window.URL.createObjectURL(csv);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      a.click();
      addNotification('Success', 'Audit logs exported', 'success');
    } catch {
      addNotification('Error', 'Failed to export logs', 'error');
    }
  };

  const actionLabels: Record<string, string> = {
    CONFIG_VIEW: '📖 Config Viewed',
    CONFIG_UPDATE: '⚙️ Config Updated',
    SERVER_RESTART: '🔄 Server Restarted',
    MOD_UPLOAD: '📦 Mod Uploaded',
    MOD_DELETE: '🗑️ Mod Deleted',
    USER_CREATE: '👤 User Created',
    USER_UPDATE: '✏️ User Updated',
    USER_DELETE: '🗑️ User Deleted',
    USER_LOGIN: '🔓 Login',
    USER_LOGOUT: '🔒 Logout',
    AUTHKEY_REPLACE: '🔑 AuthKey Replaced',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="h1">Audit Log</h1>
            <p className="subtitle mt-1">Track configuration, user, and mod activity</p>
          </div>
          <button onClick={handleExport} className="btn btn-secondary text-sm">
            Export as CSV
          </button>
        </div>

        <div className="card-lg">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">⟳</div>
              <p className="text-var(--text-muted) mt-2">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-var(--text-muted) py-6">No audit logs</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="card p-4 hover:bg-var(--bg-hover) transition-colors">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {actionLabels[log.action] || log.action}
                      </p>
                      <p className="text-sm text-var(--text-muted) mt-1">
                        <span className="font-medium">{log.user.username}</span>
                        {' • '}
                        <span>{log.resource}</span>
                        {log.resourceId && <span> ({log.resourceId})</span>}
                      </p>
                      {log.details && (
                        <p className="text-xs text-var(--text-muted) mt-2">{log.details}</p>
                      )}
                    </div>
                    <p className="text-xs text-var(--text-muted) whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
