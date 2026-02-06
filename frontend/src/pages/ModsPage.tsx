import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function ModsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadMods();
  }, []);

  const loadMods = async () => {
    try {
      const data = await api.listMods();
      setMods(data);
    } catch {
      addNotification('Error', 'Failed to load mods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    setUploading(true);

    try {
      await api.uploadMod(file);
      addNotification('Success', 'Mod uploaded successfully', 'success');
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        loadMods();
      }, 1000);
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMod(id);
      addNotification('Success', 'Mod deleted', 'success');
      setDeleteConfirm(null);
      await loadMods();
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(2) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const formatSha256 = (hash: string) => {
    return hash.substring(0, 8) + '...';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="h1">Mod Management</h1>
          <p className="subtitle mt-1">Upload and manage server mod files</p>
        </div>

        {['OWNER', 'ADMIN'].includes(user?.role) && (
          <div className="card-lg space-y-4">
            <h2 className="h3">Upload Mod</h2>
            <div className="space-y-3">
              <input
                type="file"
                accept=".zip"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full"
              />
              {uploadProgress > 0 && (
                <div className="bg-hover rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {uploading && <p className="text-sm text-muted">Uploading...</p>}
            </div>
          </div>
        )}

        <div className="card-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3">Installed Mods</h2>
            <span className="badge badge-warning">{mods.length} Total</span>
          </div>
          {loading ? (
            <div className="card px-6 py-4">Loading...</div>
          ) : mods.length === 0 ? (
            <p className="text-muted">No mods installed</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="text-left text-secondary border-b border-primary">
                  <tr>
                    <th className="pb-3 px-4">Filename</th>
                    <th className="pb-3 px-4">Size</th>
                    <th className="pb-3 px-4">SHA256</th>
                    <th className="pb-3 px-4">Uploaded By</th>
                    <th className="pb-3 px-4">Date</th>
                    {['OWNER', 'ADMIN'].includes(user?.role) && <th className="pb-3 px-4">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {mods.map((mod) => (
                    <tr key={mod.id} className="border-b border-subtle hover:bg-hover transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{mod.originalName}</td>
                      <td className="py-3 px-4 text-muted">{formatSize(mod.size)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted" title={mod.sha256}>
                        {formatSha256(mod.sha256)}
                      </td>
                      <td className="py-3 px-4">{mod.uploadedBy?.username || 'Unknown'}</td>
                      <td className="py-3 px-4 text-muted text-xs">
                        {formatDate(mod.uploadedAt)}
                      </td>
                      {['OWNER', 'ADMIN'].includes(user?.role) && (
                        <td className="py-3 px-4">
                          {deleteConfirm === mod.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(mod.id)}
                                className="btn btn-danger btn-sm text-xs"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn btn-secondary btn-sm text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(mod.id)}
                              className="btn btn-danger btn-sm text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
