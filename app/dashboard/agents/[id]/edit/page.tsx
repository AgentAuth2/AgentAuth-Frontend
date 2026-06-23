'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { api, Agent } from '@/lib/api';

export default function EditAgentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com'
    : 'http://localhost:8000');

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${BASE_URL}/v1/agents/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setName(data.name);
        setDescription(data.description || '');
        setIsActive(data.is_active);
      } catch {
        router.push(`/dashboard/agents/${id}`);
      } finally {
        setLoading(false);
      }
    };
    loadAgent();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/v1/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          is_active: isActive
        })
      });

      if (!res.ok) throw new Error("Failed to save changes.");

      router.push(`/dashboard/agents/${id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading Agent Config...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href={`/dashboard/agents/${id}`} className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Details
          </Link>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Edit Agent Settings</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Update identifying names, description, or activation status.
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
          <label className="text-label-caps font-label-caps text-on-surface-variant block">Agent Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-caps font-label-caps text-on-surface-variant block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-sm border border-panel-border rounded-lg bg-surface-container-lowest">
          <div>
            <div className="text-body-sm font-semibold text-on-surface">Active Status</div>
            <div className="text-body-sm text-on-surface-variant">Disable to temporarily revoke access keys.</div>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-5 h-5 accent-primary-container"
          />
        </div>

        <div className="flex justify-end gap-sm pt-sm border-t border-panel-border">
          <Link href={`/dashboard/agents/${id}`} className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
