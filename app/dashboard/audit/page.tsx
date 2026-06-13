'use client';

import { useEffect, useState } from 'react';
import { api, AuditLogEntry } from '@/lib/mock-api';
import { ScrollText, Download, RefreshCw } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await api.getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

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
          <button className="flex items-center gap-xs text-body-sm font-body-sm text-primary-container hover:text-primary-fixed-dim transition-colors">
            <Download className="w-[18px] h-[18px]" />
            Export CSV
          </button>
        </div>
      </header>

      <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
        <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-sm">
            <ScrollText className="w-5 h-5 text-primary-container" />
            <h3 className="text-headline-md font-headline-md text-on-surface">Hash-Only Audit Log</h3>
          </div>
          <div className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant">
            {logs.length} entries
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
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-panel-border hover:bg-row-hover transition-colors">
                  <td className="p-sm font-code-sm text-outline-variant whitespace-nowrap">{log.created_at}</td>
                  <td className="p-sm font-code-sm text-primary-container">{log.agent_id}</td>
                  <td className="p-sm font-code-sm">{log.tool_name}</td>
                  <td className="p-sm font-code-sm text-outline-variant truncate max-w-[200px]" title={log.params_hash}>
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
