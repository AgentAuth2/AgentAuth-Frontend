'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ScrollText, ShieldAlert, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';

interface AuditLog {
  log_id: string;
  agent_id: string;
  user_sub: string;
  tool_name: string;
  params_hash: string;
  decision: string;
  deny_reason: string | null;
  latency_ms: number;
  created_at: string;
}

export default function AuditLogDetailPage({ params }: { params: Promise<{ log_id: string }> }) {
  const router = useRouter();
  const { log_id } = use(params);

  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  useEffect(() => {
    const loadLog = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${BASE_URL}/v1/audit/logs/${log_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setLog(data);
      } catch {
        setError("Failed to load audit log detail. It might not exist or you lack permissions.");
      } finally {
        setLoading(false);
      }
    };
    loadLog();
  }, [log_id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading log entry...</span>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="max-w-2xl mx-auto space-y-md">
        <Link href="/dashboard/audit" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Logs
        </Link>
        <div className="bg-error-container/20 border border-error-container/30 text-error p-md rounded-lg text-body-sm font-body-sm">
          {error || "Audit log not found."}
        </div>
      </div>
    );
  }

  const isAllow = log.decision === 'ALLOW';

  return (
    <div className="max-w-3xl mx-auto space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href="/dashboard/audit" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Audit Logs
          </Link>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Audit Decision Record</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Detailed verification breakdown for gateway transaction.
          </p>
        </div>
      </header>

      {/* Decision Summary Card */}
      <section className="bg-surface border border-panel-border rounded-xl p-md shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${isAllow ? 'bg-secondary-fixed-dim' : 'bg-error'}`} />
        
        <div className="flex justify-between items-center pb-sm border-b border-panel-border mb-md">
          <div className="flex items-center gap-sm">
            {isAllow ? (
              <div className="w-10 h-10 rounded-full bg-[rgba(42,229,0,0.1)] border border-secondary-fixed-dim/20 flex items-center justify-center text-secondary-fixed-dim">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[rgba(255,180,171,0.1)] border border-error/20 flex items-center justify-center text-error">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-body-md font-bold text-on-surface">Gateway Intercept Decision</div>
              <div className="text-xs text-outline-variant">{new Date(log.created_at).toLocaleString()}</div>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 rounded text-label-caps font-label-caps font-bold border ${
            isAllow
              ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
              : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
          }`}>
            {log.decision}
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-sm text-body-sm">
          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">Audit Log ID</span>
            <span className="col-span-2 font-code text-on-surface select-all">{log.log_id}</span>
          </div>

          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">Agent Client ID</span>
            <span className="col-span-2 font-code text-primary-container select-all">{log.agent_id}</span>
          </div>

          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">User Identifier (user_sub)</span>
            <div className="col-span-2 space-y-1">
              <span className="font-code text-on-surface select-all block">{log.user_sub || 'N/A'}</span>
              <span className="text-xs text-outline-variant flex items-center gap-xs">
                <HelpCircle className="w-3.5 h-3.5" />
                Opaque user identifier — no PII stored
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">Tool Invoked</span>
            <span className="col-span-2 font-code text-on-surface">{log.tool_name}</span>
          </div>

          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">Parameters Hash</span>
            <div className="col-span-2 space-y-1">
              <span className="font-code text-on-surface select-all block truncate max-w-full" title={log.params_hash}>
                {log.params_hash || 'N/A'}
              </span>
              <span className="text-xs text-outline-variant flex items-center gap-xs">
                <HelpCircle className="w-3.5 h-3.5" />
                SHA-256 hash of tool parameters — raw params never stored
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-xs border-b border-panel-border/30">
            <span className="text-on-surface-variant font-medium">Enforcer Latency</span>
            <span className="col-span-2 font-code text-on-surface">{log.latency_ms}ms</span>
          </div>

          {!isAllow && log.deny_reason && (
            <div className="grid grid-cols-3 py-xs">
              <span className="text-error font-medium">Deny Reason</span>
              <span className="col-span-2 text-error font-semibold bg-error-container/10 border border-error-container/20 p-xs rounded">
                {log.deny_reason}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
