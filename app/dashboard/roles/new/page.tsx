'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewRolePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/v1/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create role.");
      }

      const role = await res.json();
      // Redirect to role details page to assign scopes
      router.push(`/dashboard/roles/${role.role_id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href="/dashboard/scopes" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Scopes & Roles
          </Link>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Create Security Role</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Define a role bundle to group multiple permission scopes together.
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-panel-border rounded-xl p-md space-y-md">
        <div className="space-y-xs">
          <label className="text-label-caps font-label-caps text-on-surface-variant block">Role Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. order_support_role"
            className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps font-label-caps text-on-surface-variant block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the operational duties of this role..."
            rows={4}
            className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-sm pt-sm border-t border-panel-border">
          <Link href="/dashboard/scopes" className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
