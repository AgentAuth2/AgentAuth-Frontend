export interface Agent {
  agent_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Scope {
  scope_id: string;
  name: string;
  description: string;
}

export interface Role {
  role_id: string;
  name: string;
  description: string;
  scopes: string[];
}

export interface AuditLogEntry {
  id: string;
  created_at: string;
  agent_id: string;
  tool_name: string;
  params_hash: string;
  decision: 'ALLOW' | 'DENY';
  deny_reason: string;
  latency_ms: number;
}

export interface AuditSummary {
  active_agents: number;
  gateway_latency_ms: number;
  threats_blocked_24h: number;
}

export interface AdminConfig {
  user_auth_mode: 'native' | 'federated';
  jwks_uri: string;
  ownership_mode: 'claims' | 'assertion';
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com'
    : 'http://localhost:8000');

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_sub');
      localStorage.removeItem('user_org');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }
  return data;
}

export const api = {
  async login(email: string, password: string): Promise<any> {
    const res = await apiFetch('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (typeof window !== 'undefined' && res.access_token) {
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user_sub', res.user_sub);
      
      // Fetch me to get org_id
      try {
        const meRes = await fetch(`${BASE_URL}/v1/auth/me`, {
          headers: { 'Authorization': `Bearer ${res.access_token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          localStorage.setItem('user_org', meData.org_id);
        }
      } catch (err) {
        console.error("Failed to fetch org on login:", err);
      }
    }
    return res;
  },

  async register(email: string, password: string, orgId: string): Promise<any> {
    return await apiFetch('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, org_id: orgId })
    });
  },

  async getAuditSummary(): Promise<AuditSummary> {
    try {
      const summary = await apiFetch('/v1/audit/summary');
      const agents = await this.getAgents();
      return {
        active_agents: agents.filter(a => a.is_active).length,
        gateway_latency_ms: parseFloat(summary.avg_latency_ms?.toFixed(1)) || 0,
        threats_blocked_24h: summary.denied_calls || 0,
      };
    } catch {
      return { active_agents: 0, gateway_latency_ms: 0, threats_blocked_24h: 0 };
    }
  },

  async getAgents(): Promise<Agent[]> {
    try {
      const res = await apiFetch('/v1/agents');
      return res.map((a: any) => ({
        agent_id: a.agent_id,
        name: a.name,
        is_active: a.is_active,
        created_at: a.created_at,
      }));
    } catch {
      return [];
    }
  },

  async registerAgent(name: string): Promise<{ agent: Agent; private_key: string }> {
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('user_org') : null;
    const res = await apiFetch('/v1/agents', {
      method: 'POST',
      body: JSON.stringify({
        name,
        org_id: orgId || 'org_acme',
        description: 'Next.js Console Agent',
        metadata_: {}
      })
    });
    return {
      agent: {
        agent_id: res.agent_id,
        name: res.name,
        is_active: true,
        created_at: res.created_at,
      },
      private_key: res.private_key,
    };
  },

  async revokeAgentTokens(agentId: string): Promise<{ success: boolean }> {
    // Calling both API revocation and deactivation in DB
    await apiFetch(`/v1/agents/${agentId}/revoke`, { method: 'POST' });
    await apiFetch(`/v1/agents/${agentId}`, { method: 'DELETE' });
    return { success: true };
  },

  async getScopes(): Promise<Scope[]> {
    try {
      const res = await apiFetch('/v1/scopes');
      return res.map((s: any) => ({
        scope_id: s.scope_id,
        name: s.name,
        description: s.description || '',
      }));
    } catch {
      return [];
    }
  },

  async getRoles(): Promise<Role[]> {
    try {
      const res = await apiFetch('/v1/roles');
      const rolesWithScopes = await Promise.all(
        res.map(async (r: any) => {
          try {
            const roleDetail = await apiFetch(`/v1/roles/${r.role_id}`);
            return {
              role_id: r.role_id,
              name: r.name,
              description: r.description || '',
              scopes: roleDetail.scopes?.map((s: any) => s.name) || [],
            };
          } catch {
            return {
              role_id: r.role_id,
              name: r.name,
              description: r.description || '',
              scopes: [],
            };
          }
        })
      );
      return rolesWithScopes;
    } catch {
      return [];
    }
  },

  async getRoleScopes(roleId: string): Promise<string[]> {
    try {
      const res = await apiFetch(`/v1/roles/${roleId}`);
      return res.scopes?.map((s: any) => s.name) || [];
    } catch {
      return [];
    }
  },

  async getAuditLogs(agentId?: string): Promise<AuditLogEntry[]> {
    try {
      const url = agentId ? `/v1/audit/logs?agent_id=${agentId}` : '/v1/audit/logs';
      const res = await apiFetch(url);
      return res.map((log: any) => ({
        id: log.log_id || log.id || '',
        created_at: new Date(log.created_at).toLocaleString(),
        agent_id: log.agent_id || '',
        tool_name: log.tool_name || '',
        params_hash: log.params_hash || '',
        decision: log.decision,
        deny_reason: log.deny_reason || '',
        latency_ms: log.latency_ms,
      }));
    } catch {
      return [];
    }
  },

  async getAdminConfig(): Promise<AdminConfig> {
    try {
      const res = await apiFetch('/v1/admin/config');
      return {
        user_auth_mode: res.user_auth_mode || 'native',
        jwks_uri: res.jwks_uri || '',
        ownership_mode: res.ownership_mode || 'claims',
      };
    } catch {
      return {
        user_auth_mode: 'native',
        jwks_uri: '',
        ownership_mode: 'claims',
      };
    }
  },

  async updateAdminConfig(config: Partial<AdminConfig>): Promise<AdminConfig> {
    if (config.user_auth_mode !== undefined) {
      await apiFetch('/v1/admin/config/auth', {
        method: 'PUT',
        body: JSON.stringify({
          user_auth_mode: config.user_auth_mode,
          jwks_uri: config.jwks_uri || ''
        })
      });
    }
    if (config.ownership_mode !== undefined) {
      await apiFetch('/v1/admin/config/ownership', {
        method: 'PUT',
        body: JSON.stringify({
          ownership_mode: config.ownership_mode,
          assertion_url: '',
        })
      });
    }
    return this.getAdminConfig();
  },
};
