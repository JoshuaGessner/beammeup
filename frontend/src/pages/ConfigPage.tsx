import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { useNotifications } from '../lib/notifications';
import { api } from '../lib/api.js';
import { Layout } from '../components/Layout.js';
import { AuthKeyModal } from '../components/AuthKeyModal.js';

const mapPresets = [
  { label: 'Hirochi Raceway', value: '/levels/hirochi_raceway/info.json' },
  { label: 'West Coast USA', value: '/levels/west_coast_usa/info.json' },
  { label: 'East Coast USA', value: '/levels/east_coast_usa/info.json' },
  { label: 'Italy', value: '/levels/italy/info.json' },
  { label: 'Utah', value: '/levels/utah/info.json' },
  { label: 'Gridmap', value: '/levels/gridmap_v2/info.json' },
  { label: 'Industrial Site', value: '/levels/industrial/info.json' },
  { label: 'Small Island', value: '/levels/small_island/info.json' },
  { label: 'Jungle Rock Island', value: '/levels/jungle_rock_island/info.json' },
  { label: 'Automation Test Track', value: '/levels/automation_test_track/info.json' },
];

const formatMapLabel = (value: string) => {
  const cleaned = value
    .replace(/^\/?levels\//i, '')
    .replace(/\/info\.json$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  if (!cleaned) return 'Unknown Map';

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function ConfigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [authKeySet, setAuthKeySet] = useState<boolean | null>(null);
  const [showAuthKeyModal, setShowAuthKeyModal] = useState(false);
  const [showMapAdvanced, setShowMapAdvanced] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    api
      .getCurrentConfig()
      .then((cfg) => {
        setOriginalConfig(cfg);
        setConfig(cfg);
        setIsDirty(false);
      })
      .finally(() => setLoading(false));

    api
      .getAuthheyStatus()
      .then((status) => setAuthKeySet(status.isSet))
      .catch(() => setAuthKeySet(null));
  }, []);

  // Detect changes
  useEffect(() => {
    if (config && originalConfig) {
      setIsDirty(JSON.stringify(config) !== JSON.stringify(originalConfig));
    }
  }, [config, originalConfig]);

  const handleSave = async (restart: boolean = false) => {
    setSaving(true);

    try {
      await api.updateConfig(config);
      setOriginalConfig(config);
      setIsDirty(false);
      addNotification('Success', 'Configuration saved', 'success');

      if (restart && ['OWNER', 'ADMIN'].includes(user?.role)) {
        await api.restartServer();
        addNotification('Success', 'Server restarted successfully', 'success');
      }
    } catch (err: any) {
      addNotification('Error', err.response?.data?.error || 'Failed to save config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAuthKeyReplaced = () => {
    addNotification('Success', 'AuthKey replaced successfully', 'success');
    setAuthKeySet(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-var(--border-primary) border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-var(--text-muted)">Loading configuration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentMapValue = config?.General?.Map || '';
  const currentMapLabel = currentMapValue ? formatMapLabel(currentMapValue) : 'Select a map';
  const presetValues = mapPresets.map((preset) => preset.value);
  const showCurrentMap = currentMapValue && !presetValues.includes(currentMapValue);
  const mapOptions = showCurrentMap
    ? [{ label: `${currentMapLabel} (Current)`, value: currentMapValue }, ...mapPresets]
    : mapPresets;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="h1">Server Configuration</h1>
          <p className="subtitle mt-1">Adjust server settings and gameplay options</p>
        </div>

        {isDirty && (
          <div className="bg-amber-500/15 text-amber-200 p-3 rounded-lg border border-amber-500/30">
            <span className="font-semibold">●</span> You have unsaved changes
          </div>
        )}

        <div className="card-lg space-y-6">
          <h2 className="h3">General Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Server Name</label>
              <input
                type="text"
                value={config?.General?.Name || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, Name: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Port</label>
              <input
                type="number"
                value={config?.General?.Port || 3001}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, Port: parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Players</label>
              <input
                type="number"
                value={config?.General?.MaxPlayers || 32}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, MaxPlayers: parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Cars</label>
              <input
                type="number"
                value={config?.General?.MaxCars || 1}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, MaxCars: parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Map</label>
              <div className="space-y-3">
                <select
                  value={currentMapValue}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      General: { ...config.General, Map: e.target.value },
                    })
                  }
                  className="w-full"
                >
                  <option value="">Select a map</option>
                  {mapOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="field-hint">
                  {currentMapValue ? `Current: ${currentMapLabel}` : 'Select a map to apply it.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowMapAdvanced((prev) => !prev)}
                  className="btn-ghost text-sm px-0"
                >
                  {showMapAdvanced ? 'Hide Advanced Path' : 'Advanced: Edit Map Path'}
                </button>
                {showMapAdvanced && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      Map Path
                    </label>
                    <input
                      type="text"
                      value={currentMapValue}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          General: { ...config.General, Map: e.target.value },
                        })
                      }
                      className="w-full font-mono text-sm"
                    />
                    <p className="field-hint mt-2">Example: /levels/hirochi_raceway/info.json</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Server IP</label>
              <input
                type="text"
                value={config?.General?.IP || '0.0.0.0'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, IP: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={config?.General?.Description || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  General: { ...config.General, Description: e.target.value },
                })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.General?.AllowGuests || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, AllowGuests: e.target.checked },
                  })
                }
                className="mr-2"
              />
              Allow Guests
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.General?.LogChat || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, LogChat: e.target.checked },
                  })
                }
                className="mr-2"
              />
              Log Chat
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.General?.Debug || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, Debug: e.target.checked },
                  })
                }
                className="mr-2"
              />
              Debug Mode
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.General?.Private || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    General: { ...config.General, Private: e.target.checked },
                  })
                }
                className="mr-2"
              />
              Private Server
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleSave(false)} className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          {['OWNER', 'ADMIN'].includes(user?.role) && (
            <button onClick={() => handleSave(true)} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save & Restart Server'}
            </button>
          )}
        </div>

        {['OWNER', 'ADMIN'].includes(user?.role) && (
          <div className="card-lg space-y-4">
            <h2 className="h3">Security</h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">BeamMP AuthKey</p>
                <p className="text-sm text-slate-400">
                  {authKeySet ? 'Key is set' : 'Key not set'}
                </p>
              </div>
              <button
                onClick={() => setShowAuthKeyModal(true)}
                className="danger"
              >
                Replace AuthKey
              </button>
            </div>
          </div>
        )}

        <AuthKeyModal
          isOpen={showAuthKeyModal}
          onClose={() => setShowAuthKeyModal(false)}
          onSuccess={handleAuthKeyReplaced}
        />
      </div>
    </Layout>
  );
}
