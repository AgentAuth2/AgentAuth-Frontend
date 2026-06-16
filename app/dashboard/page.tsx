'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuditSummary, AuditLogEntry } from '@/lib/mock-api';
import { Cpu, Zap, Shield, Lock, CheckCircle, Download } from 'lucide-react';

export default function GatewayOverview() {
  const router = useRouter();
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAuditSummary(), api.getAuditLogs()]).then(([s, l]) => {
      setSummary(s);
      setLogs(l);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Gateway Overview</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Real-time execution metrics and security pathways.</p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse-glow" />
          <span className="text-label-caps font-label-caps text-primary-container">SYSTEM NOMINAL</span>
        </div>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <MetricCard
          label="Active Agents"
          value={summary!.active_agents.toLocaleString()}
          sublabel="+12% from last week"
          icon={<Cpu className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          label="Gateway Latency (<10ms)"
          value={`${summary!.gateway_latency_ms}ms`}
          sublabel="P99 under 15ms"
          icon={<Zap className="w-5 h-5" />}
          trend="stable"
        />
        <MetricCard
          label="Threats Blocked (24h)"
          value={summary!.threats_blocked_24h.toLocaleString()}
          sublabel="-5% incident rate"
          icon={<Shield className="w-5 h-5" />}
          trend="down"
        />
      </section>

      {/* Gateway Flow */}
      <section className="bg-surface border border-panel-border rounded-xl p-md mb-lg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, #00e5ff 0%, transparent 60%)' }} />
        <div className="flex justify-between items-center mb-lg relative z-10">
          <h3 className="text-headline-md font-headline-md text-on-surface">Gateway Request Flow</h3>
          <div className="bg-surface-container-highest border border-panel-border px-sm py-xs rounded">
            <span className="text-code-sm font-code-sm text-primary-container">POST /v1/gateway/execute</span>
          </div>
        </div>

        <div className="mb-lg bg-surface-container-lowest border border-panel-border rounded-lg p-sm relative z-10 w-fit">
          <div className="text-label-caps font-label-caps text-on-surface-variant mb-xs">Required Authorization Headers</div>
          <div className="text-code-sm font-code-sm text-on-surface mb-1">
            <span className="text-outline-variant">Authorization:</span> Bearer <span className="text-primary-container">{'{agent_token}'}</span>
          </div>
          <div className="text-code-sm font-code-sm text-on-surface">
            <span className="text-outline-variant">X-User-Token:</span> Bearer <span className="text-primary-container">{'{user_jwt}'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative z-10 px-md py-lg overflow-x-auto gap-sm">
          <FlowNode label="Tool Call" icon={<Shield className="w-5 h-5" />} />
          <Gate label="Agent RSA Signature & Redis Check" />
          <Gate label="Scope Engine Auth" />
          <Gate label="User Identity JWKS Verify" />
          <Gate label="Data Ownership Binding" />
        </div>
      </section>

      {/* Audit Log Preview */}
      <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
        <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-headline-md font-headline-md text-on-surface">Hash-Only Audit Log</h3>
          <button className="flex items-center gap-xs text-body-sm font-body-sm text-primary-container hover:text-primary-fixed-dim transition-colors">
            <Download className="w-[18px] h-[18px]" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-panel-border">
                <Th>created_at</Th>
                <Th>agent_id</Th>
                <Th>tool_name</Th>
                <Th>params_hash (SHA-256)</Th>
                <Th>decision</Th>
                <Th className="text-right">latency_ms</Th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {logs.map((log, i) => (
                <tr
                  key={i}
                  onClick={() => router.push(`/dashboard/audit/${log.id}`)}
                  className="border-b border-panel-border hover:bg-row-hover transition-colors cursor-pointer"
                >
                  <td className="p-sm font-code-sm text-outline-variant whitespace-nowrap">{log.created_at}</td>
                  <td className="p-sm font-code-sm text-primary-container">{log.agent_id}</td>
                  <td className="p-sm font-code-sm">{log.tool_name}</td>
                  <td className="p-sm font-code-sm text-outline-variant truncate max-w-[150px]" title={log.params_hash}>
                    {log.params_hash.slice(0, 16)}...
                  </td>
                  <td className="p-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-label-caps font-label-caps border ${
                      log.decision === 'ALLOW'
                        ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                        : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                    }`}>
                      {log.decision}
                    </span>
                  </td>
                  <td className="p-sm text-right font-code-sm">{log.latency_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-sm text-label-caps font-label-caps text-on-surface-variant font-normal ${className}`}>{children}</th>;
}

function MetricCard({ label, value, sublabel, icon, trend }: {
  label: string; value: string; sublabel: string; icon: React.ReactNode; trend: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="bg-surface border border-panel-border rounded-lg p-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-surface-container-high opacity-0 group-hover:opacity-10 transition-opacity" />
      <div className="flex justify-between items-start mb-sm relative z-10">
        <span className="text-label-caps font-label-caps text-on-surface-variant">{label}</span>
        <span className="text-primary-container">{icon}</span>
      </div>
      <div className="text-headline-lg font-headline-lg text-on-surface mb-1 relative z-10">{value}</div>
      <div className="text-body-sm font-body-sm text-secondary-fixed-dim flex items-center gap-1 relative z-10">
        {trend === 'up' && <span className="text-secondary-fixed-dim">&#9650;</span>}
        {trend === 'down' && <span className="text-secondary-fixed-dim">&#9660;</span>}
        {trend === 'stable' && <CheckCircle className="w-4 h-4" />}
        {sublabel}
      </div>
    </div>
  );
}

function FlowNode({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-sm flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-surface-container border border-panel-border flex items-center justify-center">
        <span className="text-primary-container">{icon}</span>
      </div>
      <span className="text-label-caps font-label-caps text-on-surface-variant text-center">{label}</span>
    </div>
  );
}

function Gate({ label }: { label: string }) {
  return (
    <>
      <div className="hidden lg:block flex-1 h-[2px] bg-outline-variant relative">
        <div className="absolute inset-0 flow-line" />
      </div>
      <div className="flex flex-col items-center gap-sm flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-background border border-panel-border flex items-center justify-center shadow-[0_0_8px_rgba(42,229,0,0.2)]">
          <Lock className="w-4 h-4 text-secondary-fixed-dim" />
        </div>
        <span className="text-label-caps font-label-caps text-on-surface text-center max-w-[100px]">{label}</span>
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-sm text-primary-container">
        <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="text-label-caps font-label-caps">Loading gateway data...</span>
      </div>
    </div>
  );
}
