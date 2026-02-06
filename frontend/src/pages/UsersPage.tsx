import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'VIEWER',
    email: '',
  });
  const [editData, setEditData] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!['OWNER', 'ADMIN'].includes(user?.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError('');
      const data = await api.listUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.createUser(
        formData.username,
        formData.password,
        formData.role,
        formData.email
      );
      setSuccess('User created');
      setFormData({ username: '', password: '', role: 'VIEWER', email: '' });
      setShowForm(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setEditData({ role: u.role, isActive: u.isActive, password: '' });
  };

  const handleSaveEdit = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      await api.updateUser(id, editData);
      setSuccess('User updated');
      setEditingId(null);
      setEditData({});
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;

    try {
      setError('');
      await api.deleteUser(id);
      setSuccess('User deleted');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-sm text-slate-400">Control access and roles for your team.</p>
        </div>

        {error && <div className="bg-red-600/80 text-white p-3 rounded">{error}</div>}
        {success && <div className="bg-emerald-600/80 text-white p-3 rounded">{success}</div>}

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="primary">
            Create User
          </button>
        )}

        {showForm && (
          <div className="panel p-6">
            <h2 className="text-xl font-bold mb-4">New User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full"
                >
                  <option>OWNER</option>
                  <option>ADMIN</option>
                  <option>OPERATOR</option>
                  <option>VIEWER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="panel p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Users</h2>
            <span className="badge badge-warning">{users.length} Total</span>
          </div>
          {loading ? (
            <div className="panel px-6 py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-2">Username</th>
                    <th className="py-2 px-2">Role</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Last Login</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    editingId === u.id ? (
                      <tr key={u.id} className="border-b border-slate-800 bg-slate-800/40">
                        <td className="py-3 px-2 font-medium">{u.username}</td>
                        <td className="py-3 px-2">
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            className="bg-slate-900/70 border border-slate-700 rounded px-2 py-1 text-sm"
                          >
                            <option>OWNER</option>
                            <option>ADMIN</option>
                            <option>OPERATOR</option>
                            <option>VIEWER</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editData.isActive}
                              onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                            />
                            {editData.isActive ? 'Active' : 'Inactive'}
                          </label>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-400">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              className="primary text-xs px-2 py-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="secondary text-xs px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/60">
                        <td className="py-3 px-2 font-medium">{u.username}</td>
                        <td className="py-3 px-2">{u.role}</td>
                        <td className="py-3 px-2">
                          <span className={u.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-400">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            {u.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => handleEdit(u)}
                                  className="secondary text-xs px-2 py-1"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(u.id, u.username)}
                                  className="danger text-xs px-2 py-1"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
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
