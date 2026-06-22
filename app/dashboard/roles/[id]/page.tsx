'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Cpu, Trash2, Plus, RefreshCw } from 'lucide-react';

interface ScopeResponse {
  scope_id: string;
  name: string;
  description: string;
}

interface AgentResponse {
  agent_id: string;
  name: string;
  is_active: boolean;
}

interface RoleDetail {
  role_id: string;
  name: string;
  description: string;
  scopes: ScopeResponse[];
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [allScopes, setAllScopes] = useState<ScopeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedScopeId, setSelectedScopeId] = useState('');
  const [addingScope, setAddingScope] = useState(false);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  const loadRoleData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch Role details (includes scopes list in RoleDetailResponse)
      const roleRes = await fetch(`${BASE_URL}/v1/roles/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!roleRes.ok) throw new Error();
      const roleData = await roleRes.json();
      setRole(roleData);

      // Fetch Agents with this role
      const agentsRes = await fetch(`${BASE_URL}/v1/roles/${id}/agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData);
      }

      // Fetch All Scopes (for the assign scope dropdown)
      const scopesRes = await fetch(`${BASE_URL}/v1/scopes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (scopesRes.ok) {
        const scopesData = await scopesRes.json();
        // Filter out scopes already in role
        const roleScopeIds = roleData.scopes.map((s: any) => s.scope_id);
        const filtered = scopesData.filter((s: any) => !roleScopeIds.includes(s.scope_id));
        setAllScopes(filtered);
      }

    } catch (err) {
      console.error(err);
      router.push('/dashboard/scopes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoleData();
  }, [id]);

  const handleAddScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScopeId) return;

    setAddingScope(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/v1/roles/${id}/scopes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scope_id: selectedScopeId })
      });

      if (!res.ok) throw new Error();
      setSelectedScopeId('');
      loadRoleData();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingScope(false);
    }
  };

  const handleRemoveScope = async (scopeId: string) => {
    if (!confirm("Remove this scope from the role?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/v1/roles/${id}/scopes/${scopeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadRoleData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !role) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading Role Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {/* Header */}
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <Link href="/dashboard/scopes" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Engine
          </Link>
          <div className="flex items-center gap-xs">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">{role.name}</h2>
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {role.description || "No description provided."}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* Left Column: Assigned Scopes & Add Scope Form */}
        <div className="lg:col-span-2 space-y-md">
          {/* Add Scope to Role Section */}
          <section className="bg-surface border border-panel-border rounded-xl p-md shadow-sm">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-sm flex items-center gap-xs">
              <Plus className="w-5 h-5 text-primary-container" />
              Add Scope to Role
            </h3>
            <form onSubmit={handleAddScope} className="flex gap-sm items-end">
              <div className="flex-1 space-y-xs">
                <label className="text-label-caps font-label-caps text-on-surface-variant block">Available Scopes</label>
                <select
                  required
                  value={selectedScopeId}
                  onChange={e => setSelectedScopeId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
                >
                  <option value="" disabled>Select a scope to assign...</option>
                  {allScopes.map(scope => (
                    <option key={scope.scope_id} value={scope.scope_id}>
                      {scope.name} ({scope.description.slice(0, 40)}...)
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={addingScope || !selectedScopeId}
                className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60 h-[38px] flex items-center"
              >
                {addingScope ? 'Adding...' : 'Add Scope'}
              </button>
            </form>
          </section>

          {/* Role Scope List */}
          <section className="bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-sm border-b border-panel-border bg-surface-container-lowest">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
                <Lock className="w-5 h-5 text-primary-container" />
                Assigned Scopes
              </h3>
            </div>
            <div className="divide-y divide-panel-border">
              {role.scopes.length > 0 ? (
                role.scopes.map(scope => (
                  <div key={scope.scope_id} className="p-sm hover:bg-row-hover transition-colors flex justify-between items-center">
                    <div>
                      <div className="font-code text-primary-container font-semibold">{scope.name}</div>
                      <div className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{scope.description}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveScope(scope.scope_id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-lg text-center text-on-surface-variant text-body-sm font-body-sm">
                  No scopes assigned. Choose an available scope above to assign.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Agents using this Role */}
        <section className="bg-surface border border-panel-border rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
          <div className="p-sm border-b border-panel-border bg-surface-container-lowest">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
              <Cpu className="w-5 h-5 text-primary-container" />
              Assigned Agents
            </h3>
          </div>
          <div className="divide-y divide-panel-border">
            {agents.length > 0 ? (
              agents.map(agent => (
                <div key={agent.agent_id} className="p-sm hover:bg-row-hover transition-colors flex justify-between items-center text-body-sm">
                  <div>
                    <div className="font-semibold text-on-surface">{agent.name}</div>
                    <div className="font-code-sm text-code-sm text-outline-variant truncate max-w-[150px]">{agent.agent_id}</div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-label-caps font-label-caps border ${
                    agent.is_active
                      ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                      : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                  }`}>
                    {agent.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-lg text-center text-on-surface-variant text-body-sm font-body-sm">
                No agents hold this role.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
