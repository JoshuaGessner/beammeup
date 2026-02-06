import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';

export function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
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
      const data = await api.listUsers();
      setUsers(data);
    } catch {
      addNotification('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.createUser(
        formData.username,
        formData.password,
        formData.role,
        formData.email
      );
      addNotification('Success', 'User created successfully', 'success');
      setFormData({ username: '', password: '', role: 'VIEWER', email: '' });
      setShowForm(false);
      await loadUsers();
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setEditData({ role: u.role, isActive: u.isActive, password: '' });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await api.updateUser(id, editData);
      addNotification('Success', 'User updated successfully', 'success');
      setEditingId(null);
      setEditData({});
      await loadUsers();
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;

    try {
      await api.deleteUser(id);
      addNotification('Success', 'User deleted', 'success');
      await loadUsers();
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="h1">User Management</h1>
          <p className="subtitle mt-1">Manage user accounts and roles</p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Create User
          </button>
        )}

        {showForm && (
          <div className="card-lg">
            <h2 className="h3 mb-4">New User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="john_doe"
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter secure password"
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  <option>OWNER</option>
                  <option>ADMIN</option>
                  <option>OPERATOR</option>
                  <option>VIEWER</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="input"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3">All Users</h2>
            <span className="badge badge-info">{users.length} Total</span>
          </div>
          {loading ? (
            <div className="card px-6 py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="text-left text-var(--text-secondary) border-b border-var(--border-primary)">
                  <tr>
                    <th className="pb-3 px-4">Username</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Last Login</th>
                    <th className="pb-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    editingId === u.id ? (
                      <tr key={u.id} className="border-b border-var(--border-subtle) bg-var(--bg-hover)">
                        <td className="py-3 px-4 font-medium">{u.username}</td>
                        <td className="py-3 px-4">
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            className="input text-sm"
                          >
                            <option>OWNER</option>
                            <option>ADMIN</option>
                            <option>OPERATOR</option>
                            <option>VIEWER</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editData.isActive}
                              onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                            />
                            <span className="text-sm">{editData.isActive ? 'Active' : 'Inactive'}</span>
                          </label>
                        </td>
                        <td className="py-3 px-4 text-xs text-var(--text-muted)">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              className="btn btn-primary btn-sm text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-secondary btn-sm text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={u.id} className="border-b border-var(--border-subtle) hover:bg-var(--bg-hover) transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{u.username}</td>
                        <td className="py-3 px-4">{u.role}</td>
                        <td className="py-3 px-4">
                          <span className={u.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-var(--text-muted)">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {u.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => handleEdit(u)}
                                  className="btn btn-secondary btn-sm text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(u.id, u.username)}
                                  className="btn btn-danger btn-sm text-xs"
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
