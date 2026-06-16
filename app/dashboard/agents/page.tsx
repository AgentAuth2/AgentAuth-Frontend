'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Agent } from '@/lib/mock-api';
import { RegisterAgentModal } from '@/components/dashboard/register-agent-modal';
import { Cpu, Plus, Ban, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AgentRegistryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const loadAgents = async () => {
    const data = await api.getAgents();
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => { loadAgents(); }, []);

  const handleRevoke = async (agentId: string) => {
    setRevoking(agentId);
    await api.revokeAgentTokens(agentId);
    setAgents(prev => prev.map(a => a.agent_id === agentId ? { ...a, is_active: false } : a));
    setRevoking(null);
  };

  const handleRegistered = async () => {
    setRegisterOpen(false);
    setLoading(true);
    await loadAgents();
  };

  if (loading) return <Loading />;

  return (
    <>
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Agent Registry</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Manage agent identities and token revocation.</p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center gap-xs"
        >
          <Plus className="w-4 h-4" />
          Register Agent
        </Link>
      </header>

      <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
        <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-headline-md font-headline-md text-on-surface">Registered Agents</h3>
          <div className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant">
            <Cpu className="w-4 h-4" />
            {agents.length} agents
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-panel-border">
                <Th>agent_id</Th>
                <Th>name</Th>
                <Th>status</Th>
                <Th>created_at</Th>
                <Th className="text-right">actions</Th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {agents.map(agent => (
                <tr key={agent.agent_id} className="border-b border-panel-border hover:bg-row-hover transition-colors">
                  <td className="p-sm font-code-sm text-primary-container">
                    <Link href={`/dashboard/agents/${agent.agent_id}`} className="hover:underline">
                      {agent.agent_id}
                    </Link>
                  </td>
                  <td className="p-sm font-code-sm">
                    <Link href={`/dashboard/agents/${agent.agent_id}`} className="hover:underline">
                      {agent.name}
                    </Link>
                  </td>
                  <td className="p-sm">
                    <span className={`inline-flex items-center gap-xs px-2 py-1 rounded text-label-caps font-label-caps border ${
                      agent.is_active
                        ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                        : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                    }`}>
                      {agent.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {agent.is_active ? 'ACTIVE' : 'REVOKED'}
                    </span>
                  </td>
                  <td className="p-sm font-code-sm text-outline-variant whitespace-nowrap">
                    {new Date(agent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-sm text-right">
                    {agent.is_active && (
                      <button
                        onClick={() => handleRevoke(agent.agent_id)}
                        disabled={revoking === agent.agent_id}
                        className="inline-flex items-center gap-xs px-sm py-1 rounded text-label-caps font-label-caps text-error border border-error/30 hover:bg-error/10 transition-colors disabled:opacity-60"
                      >
                        {revoking === agent.agent_id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                        Revoke Tokens
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RegisterAgentModal
        open={registerOpen}
        onClose={() => {
          setRegisterOpen(false);
          handleRegistered();
        }}
      />
    </>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-sm text-label-caps font-label-caps text-on-surface-variant font-normal ${className}`}>{children}</th>;
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-sm text-primary-container">
        <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="text-label-caps font-label-caps">Loading agents...</span>
      </div>
    </div>
  );
}
