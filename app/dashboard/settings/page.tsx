'use client';

import { useEffect, useState } from 'react';
import { api, AdminConfig } from '@/lib/api';
import { Settings, Save, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminConfig().then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateAdminConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save configuration settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <Loading />;

  return (
    <>
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Admin Config</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Gateway authentication and ownership settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg transition-colors flex items-center gap-xs ${
            saved
              ? 'bg-secondary-container text-on-secondary'
              : 'bg-primary-container text-on-primary hover:bg-primary-fixed-dim disabled:opacity-60'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {error && (
        <div className="mb-sm bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm max-w-2xl">
          {error}
        </div>
      )}

      <div className="max-w-2xl space-y-md">
        {/* User Auth Mode */}
        <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
          <div className="p-sm border-b border-panel-border bg-surface-container-lowest flex items-center gap-sm">
            <Settings className="w-5 h-5 text-primary-container" />
            <h3 className="text-headline-md font-headline-md text-on-surface">User Authentication Mode</h3>
          </div>
          <div className="p-md space-y-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-label-md font-label-md text-on-surface mb-xs">Auth Mode</div>
                <div className="text-body-sm font-body-sm text-on-surface-variant">Choose between native email/password or federated identity provider.</div>
              </div>
              <div className="flex bg-surface-container-lowest border border-panel-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setConfig({ ...config, user_auth_mode: 'native' })}
                  className={`px-sm py-xs text-label-caps font-label-caps transition-colors ${
                    config.user_auth_mode === 'native'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Native
                </button>
                <button
                  onClick={() => setConfig({ ...config, user_auth_mode: 'federated' })}
                  className={`px-sm py-xs text-label-caps font-label-caps transition-colors ${
                    config.user_auth_mode === 'federated'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Federated
                </button>
              </div>
            </div>

            {config.user_auth_mode === 'federated' && (
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">JWKS URI</label>
                <input
                  type="url"
                  value={config.jwks_uri}
                  onChange={e => setConfig({ ...config, jwks_uri: e.target.value })}
                  placeholder="https://auth.example.com/.well-known/jwks.json"
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors font-code-sm"
                />
              </div>
            )}
          </div>
        </section>

        {/* Ownership Mode */}
        <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
          <div className="p-sm border-b border-panel-border bg-surface-container-lowest flex items-center gap-sm">
            <Settings className="w-5 h-5 text-primary-container" />
            <h3 className="text-headline-md font-headline-md text-on-surface">Ownership Mode</h3>
          </div>
          <div className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-label-md font-label-md text-on-surface mb-xs">Binding Strategy</div>
                <div className="text-body-sm font-body-sm text-on-surface-variant">
                  {config.ownership_mode === 'claims'
                    ? 'Data ownership verified via JWT claims (sub field).'
                    : 'Data ownership verified via external Assertion API callback.'
                  }
                </div>
              </div>
              <div className="flex bg-surface-container-lowest border border-panel-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setConfig({ ...config, ownership_mode: 'claims' })}
                  className={`px-sm py-xs text-label-caps font-label-caps transition-colors ${
                    config.ownership_mode === 'claims'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Claims-based
                </button>
                <button
                  onClick={() => setConfig({ ...config, ownership_mode: 'assertion' })}
                  className={`px-sm py-xs text-label-caps font-label-caps transition-colors ${
                    config.ownership_mode === 'assertion'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Assertion API
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Current Config */}
        <section className="bg-surface-container-lowest border border-panel-border rounded-lg p-sm">
          <div className="text-label-caps font-label-caps text-on-surface-variant mb-xs">Current Configuration (PUT /v1/admin/config/auth)</div>
          <pre className="text-code-sm font-code-sm text-on-surface overflow-x-auto">
{JSON.stringify({
  user_auth_mode: config.user_auth_mode,
  jwks_uri: config.jwks_uri,
  ownership_mode: config.ownership_mode,
}, null, 2)}
          </pre>
        </section>
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-sm text-primary-container">
        <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="text-label-caps font-label-caps">Loading config...</span>
      </div>
    </div>
  );
}
