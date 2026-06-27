'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api, Agent } from '@/lib/api';
import { CheckCircle, AlertTriangle, Copy, X } from 'lucide-react';

interface RegisterAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterAgentModal({ open, onClose }: RegisterAgentModalProps) {
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
      setError(err.message || 'Registration failed. The agent name may already exist.');
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
      // clipboard not available
    }
  };

  const handleClose = () => {
    setResult(null);
    setName('');
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-panel border-panel-border max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container" />

        {!result ? (
          <>
            <DialogHeader className="p-md pb-sm">
              <DialogTitle className="text-headline-md font-headline-md text-on-surface">Register New Agent</DialogTitle>
              <DialogDescription className="text-body-sm font-body-sm text-on-surface-variant">
                Create a new agent identity. A private RSA key will be generated for authentication.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-md pt-0">
              {error && (
                <div className="mb-sm bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm flex gap-xs items-center">
                  <span>{error}</span>
                </div>
              )}
              <div className="mb-sm">
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">Agent Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. AI-Support-Worker-01"
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" onClick={handleClose} className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
                >
                  {loading ? 'Registering...' : 'Register Agent'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="p-md pb-sm flex items-start gap-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-fixed-dim/10 flex items-center justify-center border border-secondary-fixed-dim/20">
                <CheckCircle className="w-5 h-5 text-secondary-fixed-dim" />
              </div>
              <div>
                <DialogTitle className="text-headline-md font-headline-md text-on-surface mb-xs">Agent Registered Successfully</DialogTitle>
                <DialogDescription className="text-body-sm font-body-sm text-on-surface-variant">
                  Your new agent <span className="font-code-sm text-code-sm text-on-surface bg-surface-container px-2 py-1 rounded">{result.agent.name}</span> has been created. Use the following private_key for authentication.
                </DialogDescription>
              </div>
            </div>

            <div className="p-md pt-0 flex-1 flex flex-col gap-sm">
              <div className="bg-surface-container-lowest border border-panel-border rounded-lg p-sm relative">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-label-caps font-label-caps text-on-surface-variant">private_key</span>
                </div>
                <textarea
                  className="w-full h-32 bg-transparent border-none text-on-surface font-code-sm text-code-sm resize-none focus:ring-0 p-0"
                  readOnly
                  value={result.private_key}
                />
              </div>
              <div className="bg-error/10 border border-error/20 rounded-lg p-sm flex items-start gap-sm">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-body-sm font-body-sm text-error">Store private_key securely. It will not be shown again.</p>
              </div>
            </div>

            <div className="p-md pt-sm border-t border-panel-border flex justify-end gap-sm bg-surface-container-low">
              <button
                onClick={handleClose}
                className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleCopy}
                className={`font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg transition-colors flex items-center gap-xs ${
                  copied ? 'bg-secondary-container text-on-secondary' : 'bg-primary-container text-on-primary hover:bg-primary-fixed-dim'
                }`}
              >
                {copied ? <CheckCircle className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
                {copied ? 'Copied!' : 'Copy & Dismiss'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
