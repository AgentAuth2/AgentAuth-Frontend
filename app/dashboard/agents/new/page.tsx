'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle, Copy, Cpu } from 'lucide-react';
import { api, Agent } from '@/lib/api';

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ agent: Agent; private_key: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.registerAgent(name.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to register agent.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.private_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href="/dashboard/agents" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </Link>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Register New Agent</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Create a new agent identity. A private RSA key will be generated for authentication.
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm">
          {error}
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-surface border border-panel-border rounded-xl p-md space-y-md">
          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Agent Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. AI-Support-Worker-01"
              className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-sm pt-sm border-t border-panel-border">
            <Link href="/dashboard/agents" className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
            >
              {loading ? 'Registering...' : 'Register Agent'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface border border-panel-border rounded-xl p-md space-y-md">
          <div className="flex items-start gap-sm pb-sm border-b border-panel-border">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-fixed-dim/10 flex items-center justify-center border border-secondary-fixed-dim/20">
              <CheckCircle className="w-5 h-5 text-secondary-fixed-dim" />
            </div>
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface">Agent Registered Successfully</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Your new agent <span className="font-code text-on-surface bg-surface-container px-2 py-0.5 rounded">{result.agent.name}</span> has been created.
              </p>
            </div>
          </div>

          <div className="space-y-xs">
            <span className="text-label-caps font-label-caps text-on-surface-variant">agent_id</span>
            <div className="font-code text-code-sm text-primary-container bg-surface-container-lowest border border-panel-border rounded-lg p-sm select-all">
              {result.agent.agent_id}
            </div>
          </div>

          <div className="space-y-xs">
            <span className="text-label-caps font-label-caps text-on-surface-variant">private_key (PEM)</span>
            <div className="bg-surface-container-lowest border border-panel-border rounded-lg p-sm relative">
              <textarea
                className="w-full h-48 bg-transparent border-none text-on-surface font-code text-code-sm resize-none focus:ring-0 p-0"
                readOnly
                value={result.private_key}
              />
            </div>
          </div>

          <div className="bg-error-container/10 border border-error-container/20 rounded-lg p-sm flex items-start gap-sm">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-body-sm font-body-sm text-error">
              Store this private key securely. It will never be shown again.
            </p>
          </div>

          <div className="flex justify-end gap-sm pt-sm border-t border-panel-border">
            <button
              onClick={handleCopy}
              className={`font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg transition-colors flex items-center gap-xs ${
                copied ? 'bg-secondary-container text-on-secondary' : 'bg-primary-container text-on-primary hover:bg-primary-fixed-dim'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Private Key'}
            </button>
            <Link
              href="/dashboard/agents"
              className="bg-surface-container-high border border-panel-border text-on-surface font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-surface-bright transition-colors"
            >
              Done
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
