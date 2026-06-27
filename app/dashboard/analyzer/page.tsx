'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileArchive, Search, CheckCircle2, ChevronRight, XCircle, TerminalSquare, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '@/lib/api';

import {
  AnalysisJobResponse,
  ApplyRequest,
  ApplyResponse,
  IntegrationPlanResponse,
  UploadResponse,
} from '@/types/analyzer';

export default function AnalyzerPage() {
  const router = useRouter();
  
  // Steps: 'upload' | 'processing' | 'review' | 'applying' | 'snippets'
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'applying' | 'snippets'>('upload');
  
  const [file, setFile] = useState<File | null>(null);
  const [languageHint, setLanguageHint] = useState('');
  const [frameworkHint, setFrameworkHint] = useState('');
  
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisJobResponse | null>(null);
  const [snippetsPlan, setSnippetsPlan] = useState<IntegrationPlanResponse | null>(null);
  
  // Selection states for review
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getBaseUrl = () => BASE_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a zip file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (languageHint) formData.append('language_hint', languageHint);
    if (frameworkHint) formData.append('agent_framework_hint', frameworkHint);

    setStep('processing');
    setProgress(10);

    try {
      const res = await fetch(`${getBaseUrl()}/v1/analyze/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data: UploadResponse = await res.json();
      
      setAnalysisId(data.analysis_id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file');
      setStep('upload');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'processing' && analysisId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${getBaseUrl()}/v1/analyze/${analysisId}`, {
            headers: getAuthHeaders(),
          });
          
          if (!res.ok) throw new Error('Poll failed');
          const data: AnalysisJobResponse = await res.json();
          
          setProgress(data.progress_percent);
          
          if (data.status === 'completed') {
            setAnalysisResult(data);
            
            // Pre-select all by default
            if (data.agents) setSelectedAgents(new Set(data.agents.map(a => a.detected_name)));
            if (data.scopes) setSelectedScopes(new Set(data.scopes.filter(s => !s.already_exists_in_agentauth).map(s => s.name)));
            if (data.roles) setSelectedRoles(new Set(data.roles.filter(r => !r.already_exists_in_agentauth).map(r => r.suggested_name)));
            
            setStep('review');
            clearInterval(interval);
          } else if (data.status === 'failed') {
            toast.error(data.error_message || 'Analysis failed');
            setStep('upload');
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, analysisId]);

  const handleApply = async () => {
    if (!analysisId) return;
    setStep('applying');
    
    const request: ApplyRequest = {
      org_id: localStorage.getItem('user_org') || '',
      apply_agents: Array.from(selectedAgents),
      apply_scopes: Array.from(selectedScopes),
      apply_roles: Array.from(selectedRoles),
      skip_existing: true,
    };

    try {
      const res = await fetch(`${getBaseUrl()}/v1/analyze/${analysisId}/apply`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) throw new Error('Failed to apply');
      
      toast.success('Resources registered successfully!');
      
      // Generate integration plan
      const genRes = await fetch(`${getBaseUrl()}/v1/analyze/${analysisId}/generate-integration`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!genRes.ok) throw new Error('Failed to generate snippets');
      
      // Fetch plan
      const planRes = await fetch(`${getBaseUrl()}/v1/analyze/${analysisId}/integration-plan`, {
        headers: getAuthHeaders(),
      });
      
      if (!planRes.ok) throw new Error('Failed to fetch snippets plan');
      const planData: IntegrationPlanResponse = await planRes.json();
      
      setSnippetsPlan(planData);
      setStep('snippets');
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply analysis results');
      setStep('review');
    }
  };

  const toggleSet = (set: Set<string>, val: string, setFunc: (s: Set<string>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(val)) newSet.delete(val);
    else newSet.add(val);
    setFunc(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Code Analyzer</h1>
        <p className="text-on-surface-variant mt-2">
          Upload your project codebase to automatically detect agents, tools, and required scopes.
        </p>
      </div>

      {step === 'upload' && (
        <div className="bg-surface-container border border-panel-border rounded-xl p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            
            <div 
              className="border-2 border-dashed border-panel-border rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileArchive className="w-12 h-12 text-primary-container mb-4" />
              <h3 className="text-lg font-bold text-on-surface mb-1">Select Project ZIP</h3>
              <p className="text-on-surface-variant text-sm">
                {file ? file.name : "Click to browse or drag and drop"}
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".zip"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Language Hint (Optional)</label>
                <select 
                  className="w-full bg-surface-container-highest border border-panel-border rounded-lg px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                  value={languageHint}
                  onChange={e => setLanguageHint(e.target.value)}
                >
                  <option value="">Auto-detect</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Framework Hint (Optional)</label>
                <select 
                  className="w-full bg-surface-container-highest border border-panel-border rounded-lg px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                  value={frameworkHint}
                  onChange={e => setFrameworkHint(e.target.value)}
                >
                  <option value="">Auto-detect</option>
                  <option value="langchain">LangChain</option>
                  <option value="autogen">AutoGen</option>
                  <option value="crewai">CrewAI</option>
                  <option value="openai_agents">OpenAI Agents SDK</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!file}
              className="w-full py-3 px-4 bg-primary-container hover:opacity-90 text-on-primary-container font-bold rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Analyze Codebase
            </button>
          </form>
        </div>
      )}

      {(step === 'processing' || step === 'applying') && (
        <div className="bg-surface-container border border-panel-border rounded-xl p-8 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <RefreshCcw className="w-12 h-12 text-primary-container animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">
            {step === 'processing' ? 'Analyzing Codebase...' : 'Registering Resources...'}
          </h2>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {step === 'processing' 
              ? 'Our AI is scanning your codebase to identify agents, frameworks, and required tools.'
              : 'Creating agents, scopes, and roles in AgentAuth based on your selection.'}
          </p>
          
          {step === 'processing' && (
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 max-w-md mx-auto overflow-hidden">
              <div 
                className="bg-primary-container h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.max(5, progress)}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {step === 'review' && analysisResult && (
        <div className="space-y-6">
          <div className="bg-surface-container border border-panel-border rounded-xl p-6 flex flex-wrap gap-6 justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-success flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Analysis Complete
              </h2>
              <p className="text-on-surface-variant mt-1 text-sm">
                We analyzed {analysisResult.summary?.total_files_analyzed || 0} files and found the following.
              </p>
            </div>
            <button 
              onClick={handleApply}
              className="py-2 px-6 bg-primary-container hover:opacity-90 text-on-primary-container font-bold rounded-lg transition-opacity"
            >
              Register Selected
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Agents */}
            <div className="bg-surface-container border border-panel-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center justify-between">
                Agents
                <span className="bg-primary-container/20 text-primary-container py-1 px-3 rounded-full text-sm">
                  {analysisResult.agents?.length || 0} found
                </span>
              </h3>
              <div className="space-y-3">
                {analysisResult.agents?.map(agent => (
                  <label key={agent.detected_name} className="flex items-start gap-3 p-3 bg-surface-container-high rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors border border-transparent hover:border-panel-border">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-primary-container bg-surface-container border-panel-border rounded focus:ring-primary-container"
                      checked={selectedAgents.has(agent.detected_name)}
                      onChange={() => toggleSet(selectedAgents, agent.detected_name, setSelectedAgents)}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-on-surface">{agent.suggested_agent_name}</div>
                      <div className="text-xs text-on-surface-variant mt-1 font-mono break-all">{agent.file_path}</div>
                      <div className="text-xs text-primary-container mt-1">{agent.framework}</div>
                    </div>
                  </label>
                ))}
                {(!analysisResult.agents || analysisResult.agents.length === 0) && (
                  <p className="text-on-surface-variant text-sm italic">No agents detected.</p>
                )}
              </div>
            </div>

            {/* Scopes */}
            <div className="bg-surface-container border border-panel-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center justify-between">
                Scopes
                <span className="bg-primary-container/20 text-primary-container py-1 px-3 rounded-full text-sm">
                  {analysisResult.scopes?.length || 0} found
                </span>
              </h3>
              <div className="space-y-3">
                {analysisResult.scopes?.map(scope => {
                  const disabled = scope.already_exists_in_agentauth;
                  return (
                    <label key={scope.name} className={`flex items-start gap-3 p-3 bg-surface-container-high rounded-lg transition-colors border border-transparent ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-container-highest hover:border-panel-border'}`}>
                      <input 
                        type="checkbox" 
                        disabled={disabled}
                        className="mt-1 w-4 h-4 text-primary-container bg-surface-container border-panel-border rounded focus:ring-primary-container disabled:opacity-50"
                        checked={selectedScopes.has(scope.name)}
                        onChange={() => toggleSet(selectedScopes, scope.name, setSelectedScopes)}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-on-surface flex items-center justify-between">
                          {scope.name}
                          {disabled && <span className="text-[10px] uppercase bg-success/20 text-success px-2 py-0.5 rounded">Exists</span>}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1 line-clamp-2">{scope.description}</div>
                      </div>
                    </label>
                  );
                })}
                {(!analysisResult.scopes || analysisResult.scopes.length === 0) && (
                  <p className="text-on-surface-variant text-sm italic">No scopes detected.</p>
                )}
              </div>
            </div>

            {/* Roles */}
            <div className="bg-surface-container border border-panel-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center justify-between">
                Roles
                <span className="bg-primary-container/20 text-primary-container py-1 px-3 rounded-full text-sm">
                  {analysisResult.roles?.length || 0} suggested
                </span>
              </h3>
              <div className="space-y-3">
                {analysisResult.roles?.map(role => {
                  const disabled = role.already_exists_in_agentauth;
                  return (
                    <label key={role.suggested_name} className={`flex items-start gap-3 p-3 bg-surface-container-high rounded-lg transition-colors border border-transparent ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-container-highest hover:border-panel-border'}`}>
                      <input 
                        type="checkbox" 
                        disabled={disabled}
                        className="mt-1 w-4 h-4 text-primary-container bg-surface-container border-panel-border rounded focus:ring-primary-container disabled:opacity-50"
                        checked={selectedRoles.has(role.suggested_name)}
                        onChange={() => toggleSet(selectedRoles, role.suggested_name, setSelectedRoles)}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-on-surface flex items-center justify-between">
                          {role.suggested_name}
                          {disabled && <span className="text-[10px] uppercase bg-success/20 text-success px-2 py-0.5 rounded">Exists</span>}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">Includes {role.scopes.length} scopes</div>
                      </div>
                    </label>
                  );
                })}
                {(!analysisResult.roles || analysisResult.roles.length === 0) && (
                  <p className="text-on-surface-variant text-sm italic">No roles suggested.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {step === 'snippets' && snippetsPlan && (
        <div className="space-y-6">
          <div className="bg-surface-container border border-panel-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary-container flex items-center gap-3 mb-2">
              <TerminalSquare className="w-6 h-6" /> Integration Snippets
            </h2>
            <p className="text-on-surface-variant">
              Copy these snippets into your {snippetsPlan.language} codebase to seamlessly integrate with AgentAuth.
            </p>
          </div>

          <div className="space-y-6">
            {snippetsPlan.snippets.map(agent => (
              <div key={agent.agent_id} className="bg-surface-container border border-primary-container/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.05)]">
                <div className="bg-surface-container-high px-6 py-4 border-b border-panel-border flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{agent.agent_name}</h3>
                    <p className="text-xs font-mono text-on-surface-variant mt-1">ID: {agent.agent_id}</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {Object.entries(agent.snippets).map(([key, snippet]) => (
                    <div key={key}>
                      <h4 className="text-sm font-bold text-primary-container mb-3 uppercase tracking-wider">{snippet.title}</h4>
                      <div className="relative group">
                        <pre className="bg-[#0f172a] text-[#e2e8f0] p-4 rounded-lg overflow-x-auto text-sm font-mono border border-white/10 shadow-inner">
                          {snippet.code}
                        </pre>
                        <button 
                          className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            navigator.clipboard.writeText(snippet.code);
                            toast.success('Copied to clipboard');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {snippetsPlan.snippets.length === 0 && (
              <div className="bg-surface-container border border-panel-border rounded-xl p-10 text-center">
                <p className="text-on-surface-variant">No integration snippets generated. You may not have selected any agents.</p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => router.push('/dashboard/agents')}
                className="py-3 px-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-lg transition-colors flex items-center gap-2 border border-panel-border"
              >
                Go to Agent Registry <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
