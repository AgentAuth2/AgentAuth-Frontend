'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuditLogEntry, Agent } from '@/lib/api';
import { ScrollText, Download, RefreshCw, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = async (agentIdToFetch: string) => {
    setLoading(true);
    const [l, a] = await Promise.all([
      api.getAuditLogs(agentIdToFetch || undefined),
      api.getAgents()
    ]);
    setLogs(l);
    setAgents(a);
    setLoading(false);
  };

  useEffect(() => { loadLogs(selectedAgentId); }, [selectedAgentId]);

  const getGateForReason = (reason: string): number | null => {
    if (!reason) return null;
    const lower = reason.toLowerCase();
    if (lower.includes('agent') || lower.includes('token revoked')) return 1;
    if (lower.includes('scope')) return 2;
    if (lower.includes('user auth') || lower.includes('invalid user') || lower.includes('sub')) return 3;
    if (lower.includes('ownership') || lower.includes('assertion')) return 4;
    return null;
  };

  const displayedLogs = selectedGate 
    ? logs.filter(l => l.decision === 'DENY' && getGateForReason(l.deny_reason) === selectedGate)
    : logs;

  return (
    <>
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Audit Logs</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Hash-only audit trail for all gateway decisions.</p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={loadLogs}
            className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant hover:text-on-surface transition-colors px-sm py-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
              link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
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
      </header>

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
        <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-sm">
            <ScrollText className="w-5 h-5 text-primary-container" />
            <h3 className="text-headline-md font-headline-md text-on-surface">Hash-Only Audit Log</h3>
          </div>
          <div className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant">
            {displayedLogs.length} entries
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
                  <td className={`p-sm font-code-sm truncate max-w-[200px] ${isRevoked ? 'text-error' : 'text-outline-variant'}`} title={log.params_hash}>
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
