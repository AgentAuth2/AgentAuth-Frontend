'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cpu, Shield, Lock, ScrollText, Ban, Trash2, Plus, X, CheckCircle, RefreshCw } from 'lucide-react';
import { api, Agent } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RoleResponse {
  role_id: string;
  name: string;
  description: string;
}

interface AuditLogResponse {
  log_id: string;
  tool_name: string;
  decision: string;
  created_at: string;
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [allRoles, setAllRoles] = useState<RoleResponse[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [revoking, setRevoking] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com'
    : 'http://localhost:8000');

  const loadAgentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch Agent
      const agentRes = await fetch(`${BASE_URL}/v1/agents/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!agentRes.ok) throw new Error("Agent not found");
      const agentData = await agentRes.json();
      setAgent({
        agent_id: agentData.agent_id,
        name: agentData.name,
        is_active: agentData.is_active,
        created_at: agentData.created_at
      });

      // Fetch Roles
      const rolesRes = await fetch(`${BASE_URL}/v1/agents/${id}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      // Fetch Scopes
      const scopesRes = await fetch(`${BASE_URL}/v1/agents/${id}/scopes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (scopesRes.ok) {
        const scopesData = await scopesRes.json();
        setScopes(scopesData.scopes || []);
      }

      // Fetch Audit Logs
      const auditRes = await fetch(`${BASE_URL}/v1/agents/${id}/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.logs || []);
      }
    } catch (err) {
      console.error(err);
      router.push('/dashboard/agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [id]);

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this agent?")) return;
    setDeactivating(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/v1/agents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadAgentData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivating(false);
    }
  };

  const handleRevokeTokens = async () => {
    if (!confirm("Are you sure you want to revoke all active tokens for this agent?")) return;
    setRevoking(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/v1/agents/${id}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Tokens revoked successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(false);
    }
  };

  const handleOpenAssignModal = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${BASE_URL}/v1/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out roles already assigned
        const assignedIds = roles.map(r => r.role_id);
        const filtered = data.filter((r: any) => !assignedIds.includes(r.role_id));
        setAllRoles(filtered);
        setAssignModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/v1/agents/${id}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role_id: selectedRoleId })
      });
      setAssignModalOpen(false);
      setSelectedRoleId('');
      loadAgentData();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Remove this role assignment?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/v1/agents/${id}/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadAgentData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading Agent Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {/* Header */}
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href="/dashboard/agents" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </Link>
          <div className="flex items-center gap-xs">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">{agent.name}</h2>
            <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded text-label-caps font-label-caps border ${agent.is_active
                ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
              }`}>
              {agent.is_active ? 'ACTIVE' : 'REVOKED'}
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Agent ID: <span className="font-code text-primary-container">{agent.agent_id}</span>
          </p>
        </div>

        {agent.is_active && (
          <div className="flex gap-sm">
            <Link
              href={`/dashboard/agents/${agent.agent_id}/edit`}
              className="bg-surface-container-high border border-panel-border text-on-surface font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-surface-bright transition-colors"
            >
              Edit Details
            </Link>
            <button
              onClick={handleRevokeTokens}
              disabled={revoking}
              className="inline-flex items-center gap-xs bg-surface-container-high border border-panel-border text-on-surface font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-surface-bright transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${revoking ? 'animate-spin' : ''}`} />
              Revoke Tokens
            </button>
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center gap-xs bg-error-container/20 border border-error-container/30 text-error font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Deactivate
            </button>
          </div>
        )}
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">

        {/* Left column: Roles and Scopes */}
        <div className="lg:col-span-2 space-y-md">
          {/* Roles section */}
          <section className="bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
                <Shield className="w-5 h-5 text-primary-container" />
                Assigned Roles
              </h3>
              {agent.is_active && (
                <button
                  onClick={handleOpenAssignModal}
                  className="bg-primary-container/10 border border-primary-container/20 text-primary-container font-body-sm text-body-sm font-semibold px-sm py-1 rounded-lg hover:bg-primary-container/20 transition-colors flex items-center gap-xs"
                >
                  <Plus className="w-4 h-4" />
                  Assign Role
                </button>
              )}
            </div>
            <div className="divide-y divide-panel-border">
              {roles.length > 0 ? (
                roles.map(role => (
                  <div key={role.role_id} className="p-sm hover:bg-row-hover transition-colors flex justify-between items-center">
                    <div>
                      <div className="font-code text-on-surface font-semibold">{role.name}</div>
                      <div className="text-body-sm font-body-sm text-on-surface-variant">{role.description}</div>
                    </div>
                    {agent.is_active && (
                      <button
                        onClick={() => handleRemoveRole(role.role_id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-lg text-center text-on-surface-variant text-body-sm font-body-sm">
                  No roles assigned to this agent.
                </div>
              )}
            </div>
          </section>

          {/* Scopes Section (Flat resolved scopes) */}
          <section className="bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-sm border-b border-panel-border bg-surface-container-lowest">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
                <Lock className="w-5 h-5 text-primary-container" />
                Resolved Scope Permissions
              </h3>
            </div>
            <div className="p-md">
              {scopes.length > 0 ? (
                <div className="flex flex-wrap gap-xs">
                  {scopes.map((scope, index) => (
                    <span
                      key={index}
                      className="font-code-sm text-code-sm text-primary-container bg-primary-container/10 border border-primary-container/20 px-sm py-1 rounded"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-on-surface-variant text-body-sm font-body-sm py-sm">
                  No permission scopes resolved. Assign a role to grant permissions.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column: Audit logs */}
        <section className="bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
          <div className="p-sm border-b border-panel-border bg-surface-container-lowest">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
              <ScrollText className="w-5 h-5 text-primary-container" />
              Recent Decisions
            </h3>
          </div>
          <div className="divide-y divide-panel-border">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, index) => (
                <div key={index} className="p-sm hover:bg-row-hover transition-colors text-body-sm">
                  <div className="flex justify-between items-start mb-xs">
                    <span className="font-code font-bold text-on-surface truncate max-w-[120px]">{log.tool_name}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-label-caps font-label-caps border ${log.decision === 'ALLOW'
                        ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                        : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                      }`}>
                      {log.decision}
                    </span>
                  </div>
                  <div className="text-outline-variant text-xs">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-lg text-center text-on-surface-variant text-body-sm font-body-sm">
                No recent activity.
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Assign Role Dialog Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-panel border-panel-border max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-headline-md font-headline-md text-on-surface">Assign Role to Agent</DialogTitle>
            <DialogDescription className="text-body-sm font-body-sm text-on-surface-variant">
              Select a security role mapping for this agent tenant configuration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignRole} className="space-y-md pt-sm">
            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Available Roles</label>
              <select
                required
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
              >
                <option value="" disabled>Select a role...</option>
                {allRoles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-sm pt-sm border-t border-panel-border">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-sm py-2 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning || !selectedRoleId}
                className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
              >
                {assigning ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
