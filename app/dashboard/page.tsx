'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuditSummary, AuditLogEntry, Agent } from '@/lib/api';
import { Cpu, Zap, Shield, Lock, CheckCircle, Download, AlertCircle, Filter } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export default function GatewayOverview() {
  const router = useRouter();
const [summary, setSummary] = useState<AuditSummary | null>(null);
const [logs, setLogs] = useState<AuditLogEntry[]>([]);
const [agents, setAgents] = useState<Agent[]>([]);
const [selectedAgentId, setSelectedAgentId] = useState<string>('');
const [loading, setLoading] = useState(true);
const [selectedGate, setSelectedGate] = useState<number | null>(null);

const loadData = async (agentId?: string) => {
  setLoading(true);
  const [s, l, a] = await Promise.all([
    api.getAuditSummary(),
    api.getAuditLogs(agentId),
    api.getAgents()
  ]);
  setSummary(s);
  setLogs(l);
  setAgents(a);
  setLoading(false);
};

useEffect(() => {
  loadData(selectedAgentId || undefined);
}, [selectedAgentId]);

const getGateStats = (gateIndex: number) => {
  return logs.filter(l => l.decision === 'DENY' && getGateForReason(l.deny_reason) === gateIndex).length;
};

const displayedLogs = selectedGate
  ? logs.filter(l => l.decision === 'DENY' && getGateForReason(l.deny_reason) === selectedGate)
  : logs;

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
        value={summary?.active_agents?.toLocaleString() ?? '0'}
        sublabel="+12% from last week"
        icon={<Cpu className="w-5 h-5" />}
        trend="up"
      />
      <MetricCard
        label="Gateway Latency (<10ms)"
        value={`${summary?.gateway_latency_ms ?? 0}ms`}
        sublabel="P99 under 15ms"
        icon={<Zap className="w-5 h-5" />}
        trend="stable"
      />
      <MetricCard
        label="Threats Blocked (24h)"
        value={summary?.threats_blocked_24h?.toLocaleString() ?? '0'}
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

      <div className="flex items-center justify-between relative z-10 px-md py-lg overflow-x-auto gap-sm mt-4">
        <FlowNode label="Tool Call" icon={<Shield className="w-5 h-5" />} />
        <Gate
          label="Agent RSA Signature & Redis Check"
          stats={getGateStats(1)}
          isSelected={selectedGate === 1}
          onClick={() => setSelectedGate(selectedGate === 1 ? null : 1)}
        />
        <Gate
          label="Scope Engine Auth"
          stats={getGateStats(2)}
          isSelected={selectedGate === 2}
          onClick={() => setSelectedGate(selectedGate === 2 ? null : 2)}
        />
        <Gate
          label="User Identity JWKS Verify"
          stats={getGateStats(3)}
          isSelected={selectedGate === 3}
          onClick={() => setSelectedGate(selectedGate === 3 ? null : 3)}
        />
        <Gate
          label="Data Ownership Binding"
          stats={getGateStats(4)}
          isSelected={selectedGate === 4}
          onClick={() => setSelectedGate(selectedGate === 4 ? null : 4)}
        />
      </div>
    </section>

    {/* Audit Log Preview */}
    <div className="flex items-center gap-md mb-md">
      <div className="flex items-center gap-xs text-on-surface-variant">
        <Filter className="w-4 h-4" />
        <select
          value={selectedGate || ''}
          onChange={(e) => setSelectedGate(e.target.value ? Number(e.target.value) : null)}
          className="bg-surface border border-panel-border text-body-sm text-on-surface rounded px-2 py-1 focus:border-primary-container outline-none"
        >
          <option value="">All Gates</option>
          <option value="1">Gate 1: Agent Identity</option>
          <option value="2">Gate 2: Scope Assignment</option>
          <option value="3">Gate 3: User Identity</option>
          <option value="4">Gate 4: Ownership Binding</option>
        </select>
      </div>
      <div className="flex items-center gap-xs text-on-surface-variant">
        <Filter className="w-4 h-4" />
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="bg-surface border border-panel-border text-body-sm text-on-surface rounded px-2 py-1 focus:border-primary-container outline-none max-w-[200px]"
        >
          <option value="">All Agents</option>
          {agents.map(a => (
            <option key={a.agent_id} value={a.agent_id} className={!a.is_active ? "text-error" : ""}>
              {a.name} {!a.is_active ? "(Revoked)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>

    <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
      <div className="p-sm border-b border-panel-border flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-lowest gap-sm">
        <h3 className="text-headline-md font-headline-md text-on-surface">
          {selectedGate ? `Filtered Logs (Gate ${selectedGate})` : 'Hash-Only Audit Log'}
        </h3>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => {
              if (logs.length === 0) return;
              const headers = ['id', 'created_at', 'agent_id', 'tool_name', 'params_hash', 'decision', 'latency_ms'];
              const csvContent = [
                headers.join(','),
                ...logs.map(log => [
                  log.id,
                  log.created_at,
                  log.agent_id,
                  `"${log.tool_name}"`,
                  log.params_hash,
                  log.decision,
                  log.latency_ms
                ].join(','))
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `gateway_audit_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-xs text-body-sm font-body-sm text-primary-container hover:text-primary-fixed-dim transition-colors"
          >
            <Download className="w-[18px] h-[18px]" />
            Export CSV
          </button>
        </div>
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
              {displayedLogs.map((log, i) => {
                const agent = agents.find(a => a.agent_id === log.agent_id);
                const isRevoked = agent && !agent.is_active;
                return (
                <tr
                  key={i}
                  onClick={() => router.push(`/dashboard/audit/${log.id}`)}
                  className={`border-b border-panel-border transition-colors cursor-pointer ${isRevoked ? 'bg-[rgba(255,180,171,0.05)] hover:bg-[rgba(255,180,171,0.1)]' : 'hover:bg-row-hover'}`}
                >
                  <td className={`p-sm font-code-sm whitespace-nowrap ${isRevoked ? 'text-error' : 'text-outline-variant'}`}>{log.created_at}</td>
                  <td className={`p-sm font-code-sm ${isRevoked ? 'text-error font-bold' : 'text-primary-container'}`}>
                    {log.agent_id} {isRevoked && "(Revoked)"}
                  </td>
                  <td className={`p-sm font-code-sm ${isRevoked ? 'text-error' : ''}`}>{log.tool_name}</td>
                  <td className={`p-sm font-code-sm truncate max-w-[150px] ${isRevoked ? 'text-error' : 'text-outline-variant'}`} title={log.params_hash}>
                    {log.params_hash.slice(0, 16)}...
                  </td>
                  <td className="p-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-label-caps font-label-caps border ${log.decision === 'ALLOW'
                      ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                      : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                      }`}>
                      {log.decision}
                    </span>
                  </td>
                  <td className={`p-sm text-right font-code-sm ${isRevoked ? 'text-error' : ''}`}>{log.latency_ms}ms</td>
                </tr>
              )})}
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

function Gate({ label, stats, isSelected, onClick }: { label: string; stats?: number; isSelected?: boolean; onClick?: () => void }) {
  const hasFailures = stats !== undefined && stats > 0;

  return (
    <>
      <div className="hidden lg:block flex-1 h-[2px] bg-outline-variant relative">
        <div className={`absolute inset-0 ${isSelected ? 'bg-primary-container opacity-50' : 'flow-line'}`} />
      </div>

      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div
            className="flex flex-col items-center gap-sm flex-shrink-0 cursor-pointer group relative"
            onClick={onClick}
          >
            <div className={`w-8 h-8 rounded-full bg-background border flex items-center justify-center transition-colors ${isSelected
              ? 'border-primary-container shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'border-panel-border shadow-[0_0_8px_rgba(42,229,0,0.2)] group-hover:border-primary-container'
              } ${hasFailures && !isSelected ? 'ring-1 ring-error/50 ring-offset-1 ring-offset-background' : ''}`}>
              <Lock className={`w-4 h-4 ${isSelected ? 'text-primary-container' : (hasFailures ? 'text-error' : 'text-secondary-fixed-dim')}`} />
            </div>

            <span className={`text-label-caps font-label-caps text-center max-w-[100px] transition-colors ${isSelected ? 'text-primary-container' : 'text-on-surface group-hover:text-primary-container'
              }`}>{label}</span>

            {/* Subtle red dot instead of the ugly big number */}
            {hasFailures && (
              <div className="absolute top-0 right-[25%] w-2.5 h-2.5 bg-error rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
        </HoverCardTrigger>

        {hasFailures && (
          <HoverCardContent side="top" className="bg-surface border-panel-border w-56 p-sm shadow-xl">
            <div className="flex items-start gap-xs">
              <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-body-sm font-bold text-on-surface mb-1">{stats} Blocked Requests</h4>
                <p className="text-body-sm text-on-surface-variant leading-tight">
                  {stats} request{stats === 1 ? '' : 's'} failed the <span className="text-on-surface">{label}</span> check. Click to filter the audit log below.
                </p>
              </div>
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
    </>
  );
}

function getGateForReason(reason: string): number | null {
  if (!reason) return null;
  const lower = reason.toLowerCase();
  if (lower.includes('agent') || lower.includes('token revoked')) return 1;
  if (lower.includes('scope')) return 2;
  if (lower.includes('user auth') || lower.includes('invalid user') || lower.includes('sub')) return 3;
  if (lower.includes('ownership') || lower.includes('assertion')) return 4;
  return null;
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
