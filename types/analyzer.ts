export interface UploadResponse {
  analysis_id: string;
  status: string;
  message: string;
  files_found: number;
  files_queued_for_analysis: number;
  estimated_duration_seconds: number;
  created_at: string;
}

export interface AnalysisAgent {
  detected_name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  framework: string;
  confidence: number;
  description: string;
  detected_tools: string[];
  suggested_agent_name: string;
  suggested_scopes: string[];
  suggested_role: string;
}

export interface AnalysisScope {
  name: string;
  description: string;
  referenced_in_files: string[];
  already_exists_in_agentauth: boolean;
  existing_scope_id?: string;
}

export interface AnalysisRole {
  suggested_name: string;
  description: string;
  scopes: string[];
  already_exists_in_agentauth: boolean;
}

export interface AnalysisSummary {
  total_files_analyzed: number;
  agents_found: number;
  scopes_found: number;
  roles_suggested: number;
}

export interface AnalysisJobResponse {
  analysis_id: string;
  status: string;
  progress_percent: number;
  message?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  summary?: AnalysisSummary;
  agents?: AnalysisAgent[];
  scopes?: AnalysisScope[];
  roles?: AnalysisRole[];
  warnings?: string[];
  error_message?: string;
}

export interface GenerateIntegrationResponse {
  analysis_id: string;
  status: string;
  message: string;
}

export interface ApplyRequest {
  org_id: string;
  apply_agents?: string[];
  apply_scopes?: string[];
  apply_roles?: string[];
  skip_existing: boolean;
}

export interface ApplyResponse {
  analysis_id: string;
  created: Record<string, any>;
  skipped: Record<string, any>;
  next_step: string;
}

export interface IntegrationSnippetDetails {
  title: string;
  code: string;
}

export interface IntegrationAgentSnippet {
  agent_name: string;
  agent_id: string;
  snippets: Record<string, IntegrationSnippetDetails>;
}

export interface IntegrationPlanResponse {
  analysis_id: string;
  status: string;
  language: string;
  snippets: IntegrationAgentSnippet[];
}
