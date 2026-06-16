'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Scope, Role } from '@/lib/mock-api';
import { Lock, Shield, ChevronRight, Plus } from 'lucide-react';

export default function ScopesPage() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scopes' | 'roles'>('scopes');

  useEffect(() => {
    Promise.all([api.getScopes(), api.getRoles()]).then(([s, r]) => {
      setScopes(s);
      setRoles(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const selectedRoleData = roles.find(r => r.role_id === selectedRole);

  return (
    <>
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Role & Scope Engine</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Manage permission scopes and role assignments.</p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim" />
          <span className="text-label-caps font-label-caps text-secondary-fixed-dim">ENGINE ACTIVE</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-xs mb-lg border-b border-panel-border">
        <button
          onClick={() => setActiveTab('scopes')}
          className={`px-sm py-xs text-label-caps font-label-caps transition-colors border-b-2 -mb-px ${
            activeTab === 'scopes'
              ? 'text-primary-container border-primary-container'
              : 'text-on-surface-variant border-transparent hover:text-on-surface'
          }`}
        >
          Scopes
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-sm py-xs text-label-caps font-label-caps transition-colors border-b-2 -mb-px ${
            activeTab === 'roles'
              ? 'text-primary-container border-primary-container'
              : 'text-on-surface-variant border-transparent hover:text-on-surface'
          }`}
        >
          Roles
        </button>
      </div>

      {activeTab === 'scopes' && (
        <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
          <div className="p-sm border-b border-panel-border flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-headline-md font-headline-md text-on-surface">Defined Scopes</h3>
            <div className="flex items-center gap-sm">
              <Link
                href="/dashboard/scopes/new"
                className="bg-primary-container/10 border border-primary-container/20 text-primary-container font-body-sm text-body-sm font-semibold px-sm py-1 rounded hover:bg-primary-container/20 transition-colors flex items-center gap-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Scope
              </Link>
              <div className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant">
                <Lock className="w-4 h-4" />
                {scopes.length} scopes
              </div>
            </div>
          </div>
          <div className="divide-y divide-panel-border">
            {scopes.map(scope => (
              <div key={scope.scope_id} className="p-sm hover:bg-row-hover transition-colors flex items-center gap-sm">
                <div className="w-8 h-8 rounded bg-surface-container-lowest border border-panel-border flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-primary-container" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-code-sm text-code-sm text-on-surface mb-xs">{scope.name}</div>
                  <div className="text-body-sm font-body-sm text-on-surface-variant">{scope.description}</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 rounded text-label-caps font-label-caps bg-surface-container-high text-on-surface-variant border border-panel-border">
                    {scope.scope_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          {/* Roles list */}
          <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
            <div className="p-sm border-b border-panel-border bg-surface-container-lowest flex justify-between items-center">
              <h3 className="text-headline-md font-headline-md text-on-surface">Roles</h3>
              <Link
                href="/dashboard/roles/new"
                className="bg-primary-container/10 border border-primary-container/20 text-primary-container font-body-sm text-body-sm font-semibold px-sm py-1 rounded hover:bg-primary-container/20 transition-colors flex items-center gap-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Role
              </Link>
            </div>
            <div className="divide-y divide-panel-border">
              {roles.map(role => (
                <button
                  key={role.role_id}
                  onClick={() => setSelectedRole(role.role_id === selectedRole ? null : role.role_id)}
                  className={`w-full p-sm hover:bg-row-hover transition-colors flex items-center gap-sm text-left ${
                    selectedRole === role.role_id ? 'bg-surface-container-high' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-surface-container-lowest border border-panel-border flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-container" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-code-sm text-code-sm text-on-surface mb-xs">{role.name}</div>
                    <div className="text-body-sm font-body-sm text-on-surface-variant">{role.description}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform ${selectedRole === role.role_id ? 'rotate-90' : ''}`} />
                </button>
              ))}
            </div>
          </section>

          {/* Role scopes */}
          <section className="bg-surface border border-panel-border rounded-xl overflow-hidden">
            <div className="p-sm border-b border-panel-border bg-surface-container-lowest flex justify-between items-center">
              <h3 className="text-headline-md font-headline-md text-on-surface">
                {selectedRoleData ? `Scopes for ${selectedRoleData.name}` : 'Select a Role'}
              </h3>
              {selectedRoleData && (
                <Link
                  href={`/dashboard/roles/${selectedRoleData.role_id}`}
                  className="text-body-sm text-primary-container hover:text-primary-fixed-dim transition-colors font-semibold"
                >
                  Manage Role Scopes
                </Link>
              )}
            </div>
            {selectedRoleData ? (
              <div className="divide-y divide-panel-border">
                {selectedRoleData.scopes.map((scopeName, i) => {
                  const scopeData = scopes.find(s => s.name === scopeName);
                  return (
                    <div key={i} className="p-sm hover:bg-row-hover transition-colors flex items-center gap-sm">
                      <div className="w-6 h-6 rounded bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-3 h-3 text-secondary-fixed-dim" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-code-sm text-code-sm text-on-surface">{scopeName}</div>
                        {scopeData && (
                          <div className="text-body-sm font-body-sm text-on-surface-variant">{scopeData.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-lg flex items-center justify-center text-on-surface-variant">
                <span className="text-body-sm font-body-sm">Click a role to view its assigned scopes</span>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-sm text-primary-container">
        <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="text-label-caps font-label-caps">Loading scope engine...</span>
      </div>
    </div>
  );
}
