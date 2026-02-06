import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function ModsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('');
      const data = await api.listMods();
      setMods(data);
    } catch {
      setError('Failed to load mods');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadProgress(0);
    setUploading(true);

    try {
      await api.uploadMod(file);
      setSuccess('Mod uploaded successfully');
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        loadMods();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      await api.deleteMod(id);
      setSuccess('Mod deleted');
      setDeleteConfirm(null);
      await loadMods();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
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
          <h1 className="text-3xl font-bold">Manage Mods</h1>
          <p className="text-sm text-slate-400">Upload, review, and remove mod archives.</p>
        </div>

        {error && <div className="bg-red-600/80 text-white p-3 rounded">{error}</div>}
        {success && <div className="bg-emerald-600/80 text-white p-3 rounded">{success}</div>}

        {['OWNER', 'ADMIN'].includes(user?.role) && (
          <div className="panel p-6 space-y-4">
            <h2 className="text-xl font-bold">Upload Mod</h2>
            <div className="space-y-3">
              <input
                type="file"
                accept=".zip"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full"
              />
              {uploadProgress > 0 && (
                <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {uploading && <p className="text-sm text-slate-400">Uploading...</p>}
            </div>
          </div>
        )}

        <div className="panel p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Installed Mods</h2>
            <span className="badge badge-warning">{mods.length} Total</span>
          </div>
          {loading ? (
            <div className="panel px-6 py-4">Loading...</div>
          ) : mods.length === 0 ? (
            <p className="text-slate-400">No mods installed</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="pb-3 px-2">Filename</th>
                    <th className="pb-3 px-2">Size</th>
                    <th className="pb-3 px-2">SHA256</th>
                    <th className="pb-3 px-2">Uploaded By</th>
                    <th className="pb-3 px-2">Date</th>
                    {['OWNER', 'ADMIN'].includes(user?.role) && <th className="pb-3 px-2">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {mods.map((mod) => (
                    <tr key={mod.id} className="border-b border-slate-800 hover:bg-slate-800/60">
                      <td className="py-3 px-2 font-medium text-white">{mod.originalName}</td>
                      <td className="py-3 px-2 text-slate-400">{formatSize(mod.size)}</td>
                      <td className="py-3 px-2 font-mono text-xs text-slate-400" title={mod.sha256}>
                        {formatSha256(mod.sha256)}
                      </td>
                      <td className="py-3 px-2">{mod.uploadedBy?.username || 'Unknown'}</td>
                      <td className="py-3 px-2 text-slate-400 text-xs">
                        {formatDate(mod.uploadedAt)}
                      </td>
                      {['OWNER', 'ADMIN'].includes(user?.role) && (
                        <td className="py-3 px-2">
                          {deleteConfirm === mod.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(mod.id)}
                                className="danger text-xs px-2 py-1"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="secondary text-xs px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(mod.id)}
                              className="danger text-xs px-2 py-1"
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
