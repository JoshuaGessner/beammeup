import { useState } from 'react';
import { useNotifications } from '../lib/notifications';
import { api } from '../lib/api.js';

interface AuthKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthKeyModal({ isOpen, onClose, onSuccess }: AuthKeyModalProps) {
  const { addNotification } = useNotifications();
  const [password, setPassword] = useState('');
  const [newAuthKey, setNewAuthKey] = useState('');
  const [confirmAuthKey, setConfirmAuthKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      addNotification('Error', 'Password is required', 'error');
      return;
    }

    if (!newAuthKey || newAuthKey.length < 10) {
      addNotification('Error', 'AuthKey must be at least 10 characters', 'error');
      return;
    }

    if (newAuthKey !== confirmAuthKey) {
      addNotification('Error', 'AuthKey values do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.replaceAuthkey(newAuthKey, password);
      addNotification('Success', 'AuthKey replaced successfully', 'success');
      setPassword('');
      setNewAuthKey('');
      setConfirmAuthKey('');
      onSuccess();
      onClose();
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Failed to replace AuthKey', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card-lg max-w-md w-full mx-4 space-y-4">
        <h2 className="h3">Replace AuthKey</h2>
        <p className="text-sm text-muted">
          Enter your password and the new AuthKey. Your current key will not be displayed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Password (for verification)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              className="input disabled:opacity-50"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New AuthKey</label>
            <input
              type="password"
              value={newAuthKey}
              onChange={(e) => setNewAuthKey(e.target.value)}
              placeholder="Enter new AuthKey (min 10 characters)"
              disabled={loading}
              className="input disabled:opacity-50"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm AuthKey</label>
            <input
              type="password"
              value={confirmAuthKey}
              onChange={(e) => setConfirmAuthKey(e.target.value)}
              placeholder="Confirm new AuthKey"
              disabled={loading}
              className="input disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger flex-1 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Replacing...' : 'Replace AuthKey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
