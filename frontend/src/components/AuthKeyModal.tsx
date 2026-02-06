import { useState } from 'react';
import { api } from '../lib/api.js';

interface AuthKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthKeyModal({ isOpen, onClose, onSuccess }: AuthKeyModalProps) {
  const [password, setPassword] = useState('');
  const [newAuthKey, setNewAuthKey] = useState('');
  const [confirmAuthKey, setConfirmAuthKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required');
      return;
    }

    if (!newAuthKey || newAuthKey.length < 10) {
      setError('AuthKey must be at least 10 characters');
      return;
    }

    if (newAuthKey !== confirmAuthKey) {
      setError('AuthKey values do not match');
      return;
    }

    setLoading(true);
    try {
      await api.replaceAuthkey(newAuthKey, password);
      setPassword('');
      setNewAuthKey('');
      setConfirmAuthKey('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to replace AuthKey');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="panel p-6 max-w-md w-full mx-4 space-y-4">
        <h2 className="text-xl font-bold">Replace AuthKey</h2>
        <p className="text-sm text-slate-400">
          Enter your password and the new AuthKey. Your current key will not be displayed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password (for verification)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New AuthKey</label>
            <input
              type="password"
              value={newAuthKey}
              onChange={(e) => setNewAuthKey(e.target.value)}
              className="w-full"
              placeholder="Enter new AuthKey"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm AuthKey</label>
            <input
              type="password"
              value={confirmAuthKey}
              onChange={(e) => setConfirmAuthKey(e.target.value)}
              className="w-full"
              placeholder="Confirm new AuthKey"
              disabled={loading}
            />
          </div>

          {error && <div className="bg-red-600/80 text-white p-3 rounded text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 secondary disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 danger disabled:opacity-50"
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
