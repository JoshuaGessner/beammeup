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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadTotal, setUploadTotal] = useState(0);
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

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setUploadProgress(0);
    setUploadTotal(files.length);
  };

  const handleUploadSelected = async () => {
    if (selectedFiles.length === 0) return;

    setUploadProgress(0);
    setUploadTotal(selectedFiles.length);
    setUploading(true);

    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        await api.uploadMod(file);
        successCount += 1;
      } catch (err: any) {
        addNotification('Error', err.response?.data?.error || `Upload failed: ${file.name}`, 'error');
      } finally {
        setUploadProgress((prev) => prev + 1);
      }
    }

    if (successCount > 0) {
      addNotification('Success', `Uploaded ${successCount} mod(s)`, 'success');
    }

    setSelectedFiles([]);
    setUploading(false);
    setTimeout(() => {
      setUploadProgress(0);
      setUploadTotal(0);
      loadMods();
    }, 500);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
            <h2 className="h3">Upload Mods</h2>
            <div className="space-y-3">
              <input
                type="file"
                accept=".zip"
                multiple
                onChange={handleFileSelection}
                disabled={uploading}
                className="block w-full"
              />
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>{selectedFiles.length} file(s) selected</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-orange-300 hover:text-orange-200"
                      disabled={uploading}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-subtle rounded-lg p-2 text-sm">
                    {selectedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between py-1">
                        <span className="text-secondary">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-xs text-red-300 hover:text-red-200"
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadSelected}
                    className="btn btn-primary"
                    disabled={uploading || selectedFiles.length === 0}
                  >
                    {uploading ? 'Installing Mods...' : 'Install Selected Mods'}
                  </button>
                </div>
              )}
              {uploadTotal > 0 && (
                <div className="bg-hover rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{ width: `${Math.round((uploadProgress / uploadTotal) * 100)}%` }}
                  />
                </div>
              )}
              {uploading && uploadTotal > 0 && (
                <p className="text-sm text-muted">
                  Uploading {uploadProgress} of {uploadTotal}...
                </p>
              )}
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
