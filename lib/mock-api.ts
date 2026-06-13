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
  created_at: string;
  agent_id: string;
  tool_name: string;
  params_hash: string;
  decision: 'ALLOW' | 'DENY';
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

const MOCK_AGENTS: Agent[] = [
  { agent_id: 'agt_9f8b7c6a', name: 'AI-Support-Worker-01', is_active: true, created_at: '2024-01-15T10:30:00Z' },
  { agent_id: 'agt_2x4d5e9p', name: 'Billing-Query-Agent', is_active: true, created_at: '2024-02-20T14:00:00Z' },
  { agent_id: 'agt_7k3m1n8q', name: 'Admin-Role-Manager', is_active: false, created_at: '2024-03-01T09:15:00Z' },
  { agent_id: 'agt_4v9c2j5r', name: 'Subscription-Lister', is_active: true, created_at: '2024-03-10T16:45:00Z' },
  { agent_id: 'agt_1h6f8t3w', name: 'Data-Export-Agent', is_active: true, created_at: '2024-03-15T11:20:00Z' },
];

const MOCK_SCOPES: Scope[] = [
  { scope_id: 'scp_01', name: 'tool:get_order_details', description: 'Read order details for a specific order ID' },
  { scope_id: 'scp_02', name: 'tool:fetch_user_billing', description: 'Fetch billing information for authenticated user' },
  { scope_id: 'scp_03', name: 'tool:mutate_admin_roles', description: 'Modify admin role assignments' },
  { scope_id: 'scp_04', name: 'tool:list_active_subscriptions', description: 'List all active subscriptions for user' },
  { scope_id: 'scp_05', name: 'tool:export_user_data', description: 'Export user data in compliance format' },
  { scope_id: 'scp_06', name: 'tool:delete_user_account', description: 'Delete user account and associated data' },
  { scope_id: 'scp_07', name: 'tool:read_analytics', description: 'Read analytics data for dashboards' },
  { scope_id: 'scp_08', name: 'tool:update_payment_method', description: 'Update payment method on file' },
];

const MOCK_ROLES: Role[] = [
  { role_id: 'rol_01', name: 'support-agent', description: 'Customer support operations', scopes: ['tool:get_order_details', 'tool:fetch_user_billing', 'tool:list_active_subscriptions'] },
  { role_id: 'rol_02', name: 'admin-agent', description: 'Administrative operations', scopes: ['tool:mutate_admin_roles', 'tool:read_analytics'] },
  { role_id: 'rol_03', name: 'billing-agent', description: 'Billing and payment operations', scopes: ['tool:fetch_user_billing', 'tool:update_payment_method', 'tool:list_active_subscriptions'] },
  { role_id: 'rol_04', name: 'compliance-agent', description: 'Data compliance operations', scopes: ['tool:export_user_data', 'tool:delete_user_account'] },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { created_at: '2024-10-27 14:32:01.045', agent_id: 'agt_9f8b7c6a', tool_name: 'fetch_user_billing', params_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', decision: 'ALLOW', latency_ms: 4.1 },
  { created_at: '2024-10-27 14:31:58.912', agent_id: 'agt_2x4d5e9p', tool_name: 'mutate_admin_roles', params_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', decision: 'DENY', latency_ms: 1.2 },
  { created_at: '2024-10-27 14:31:45.330', agent_id: 'agt_9f8b7c6a', tool_name: 'list_active_subscriptions', params_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', decision: 'ALLOW', latency_ms: 5.8 },
  { created_at: '2024-10-27 14:30:22.110', agent_id: 'agt_4v9c2j5r', tool_name: 'get_order_details', params_hash: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a', decision: 'ALLOW', latency_ms: 3.2 },
  { created_at: '2024-10-27 14:29:18.778', agent_id: 'agt_1h6f8t3w', tool_name: 'export_user_data', params_hash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', decision: 'ALLOW', latency_ms: 6.4 },
  { created_at: '2024-10-27 14:28:55.421', agent_id: 'agt_2x4d5e9p', tool_name: 'update_payment_method', params_hash: 'b7a7897c5c0e5b1d8f2a4e6c9d3b7a5f1e8c4d2b6a0f9e7d5c3b1a9f8e6d4c2b', decision: 'DENY', latency_ms: 0.8 },
  { created_at: '2024-10-27 14:27:41.003', agent_id: 'agt_9f8b7c6a', tool_name: 'fetch_user_billing', params_hash: 'd7a8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', decision: 'ALLOW', latency_ms: 3.9 },
  { created_at: '2024-10-27 14:26:12.890', agent_id: 'agt_7k3m1n8q', tool_name: 'mutate_admin_roles', params_hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', decision: 'DENY', latency_ms: 1.1 },
];

let MOCK_CONFIG: AdminConfig = {
  user_auth_mode: 'native',
  jwks_uri: 'https://auth.agentauth.dev/.well-known/jwks.json',
  ownership_mode: 'claims',
};

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateAgentId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'agt_';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generatePrivateKey(): string {
  const lines = [
    'MIIEpAIBAAKCAQEA0w3Y5m7nK8pL2qR4sT6uV9wX1bZ9jK8mN2oP4qR5sT7uV9wX',
    '3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9aB1cD3eF5gH7iJ9kL1mN3oP',
    '5qR7sT9uV1wX3yZ5aB7cD9eF1gH3iJ5kL7mN9oP1qR3sT5uV7wX9yZ1aB3cD5eF',
    '7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7u',
  ];
  return `-----BEGIN RSA PRIVATE KEY-----\n${lines.join('\n')}\n-----END RSA PRIVATE KEY-----`;
}

export const api = {
  async getAuditSummary(): Promise<AuditSummary> {
    await delay();
    return { active_agents: 1248, gateway_latency_ms: 4.2, threats_blocked_24h: 842 };
  },

  async getAgents(): Promise<Agent[]> {
    await delay();
    return [...MOCK_AGENTS];
  },

  async registerAgent(name: string): Promise<{ agent: Agent; private_key: string }> {
    await delay(500);
    const agent: Agent = {
      agent_id: generateAgentId(),
      name,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    MOCK_AGENTS.unshift(agent);
    return { agent, private_key: generatePrivateKey() };
  },

  async revokeAgentTokens(agentId: string): Promise<{ success: boolean }> {
    await delay(300);
    const agent = MOCK_AGENTS.find(a => a.agent_id === agentId);
    if (agent) agent.is_active = false;
    return { success: true };
  },

  async getScopes(): Promise<Scope[]> {
    await delay();
    return [...MOCK_SCOPES];
  },

  async getRoles(): Promise<Role[]> {
    await delay();
    return [...MOCK_ROLES];
  },

  async getRoleScopes(roleId: string): Promise<string[]> {
    await delay();
    const role = MOCK_ROLES.find(r => r.role_id === roleId);
    return role ? [...role.scopes] : [];
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    await delay();
    return [...MOCK_AUDIT_LOGS];
  },

  async getAdminConfig(): Promise<AdminConfig> {
    await delay();
    return { ...MOCK_CONFIG };
  },

  async updateAdminConfig(config: Partial<AdminConfig>): Promise<AdminConfig> {
    await delay(400);
    MOCK_CONFIG = { ...MOCK_CONFIG, ...config };
    return { ...MOCK_CONFIG };
  },
};
