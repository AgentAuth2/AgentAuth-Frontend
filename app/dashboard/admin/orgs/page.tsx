'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Building, RefreshCw } from 'lucide-react';

interface Org {
  org_id?: string;
  id?: string;
  name: string;
}

export default function AdminOrgsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  const loadOrgs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${BASE_URL}/v1/admin/orgs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrgs(data);
    } catch {
      setError("Unauthorized organization administration access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/v1/admin/orgs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newOrgName.trim() })
      });

      if (!res.ok) throw new Error();
      setNewOrgName('');
      loadOrgs();
    } catch {
      setError("Failed to create organization.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading Tenant Organizations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Organization Directory</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Super admin portal to register and isolate enterprise customer tenants.
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* Left Column: Register Org Form */}
        <section className="bg-surface border border-panel-border rounded-xl p-md shadow-sm h-fit">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-sm flex items-center gap-xs">
            <Plus className="w-5 h-5 text-primary-container" />
            Register Organization
          </h3>
          <form onSubmit={handleCreateOrg} className="space-y-sm">
            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Organization Name</label>
              <input
                type="text"
                required
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !newOrgName.trim()}
              className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
            >
              {saving ? 'Registering...' : 'Register Org'}
            </button>
          </form>
        </section>

        {/* Right Column: List Orgs */}
        <section className="lg:col-span-2 bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-sm border-b border-panel-border bg-surface-container-lowest">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
              <Building className="w-5 h-5 text-primary-container" />
              Active Tenants
            </h3>
          </div>
          <div className="divide-y divide-panel-border">
            {orgs.map((org, index) => (
              <div key={index} className="p-sm hover:bg-row-hover transition-colors flex items-center gap-sm">
                <div className="w-8 h-8 rounded bg-surface-container-lowest border border-panel-border flex items-center justify-center flex-shrink-0">
                  <Building className="w-4 h-4 text-primary-container" />
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-on-surface">{org.name}</div>
                  <div className="font-code-sm text-code-sm text-outline-variant">{org.org_id || org.id}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
