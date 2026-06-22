'use client';

import { useEffect, useState } from 'react';
import { Shield, Play, FlaskConical, Terminal, Activity, Zap, RefreshCw, CheckCircle, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function GatewayConsolePage() {
  const [agentToken, setAgentToken] = useState('');
  const [userToken, setUserToken] = useState('');
  const [toolName, setToolName] = useState('test1');
  const [toolEndpoint, setToolEndpoint] = useState('https://internal.api/tools/order');
  const [toolParams, setToolParams] = useState('{"order_id": "ord_5521"}');
  
  const [loading, setLoading] = useState(false);
  const [resultMode, setResultMode] = useState<'dry' | 'execute' | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  useEffect(() => {
    const localToken = localStorage.getItem('access_token');
    if (localToken) {
      setUserToken(localToken);
    }
  }, []);

  const runCheck = async (mode: 'dry' | 'execute') => {
    setErrorMsg(null);
    setResultData(null);
    setResultMode(mode);

    let parsedParams = {};
    try {
      parsedParams = JSON.parse(toolParams.trim());
    } catch {
      setErrorMsg("Invalid JSON parameters");
      return;
    }

    setLoading(true);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const aToken = agentToken.trim().replace(/[\r\n]+/g, '');
    const uToken = userToken.trim().replace(/[\r\n]+/g, '');

    if (aToken) {
      headers['Authorization'] = aToken.startsWith('Bearer ') ? aToken : `Bearer ${aToken}`;
    }
    if (uToken) {
      headers['X-User-Token'] = uToken.startsWith('Bearer ') ? uToken : `Bearer ${uToken}`;
    }

    const endpoint = mode === 'dry' ? '/v1/gateway/check' : '/v1/gateway/execute';

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tool: toolName.trim(),
          params: parsedParams,
          tool_endpoint: toolEndpoint.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Gateway request failed.");
      }

      setResultData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Gateway Test Console</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Test the 4-check gateway enforcement. Simulate tool execution from an agent to verify access control.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        
        {/* LEFT: Config Panel */}
        <section className="bg-surface border border-panel-border rounded-xl p-md space-y-md relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary-container" />
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-xs">
            <Terminal className="w-5 h-5 text-primary-container" />
            Test Configuration
          </h3>

          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Agent Token (Bearer)</label>
            <textarea
              value={agentToken}
              onChange={e => setAgentToken(e.target.value)}
              placeholder="Paste the JWT acquired from POST /v1/agents/{id}/token"
              rows={3}
              className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-code-sm font-code-sm text-on-surface focus:outline-none placeholder:text-outline-variant resize-none"
            />
          </div>

          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">User Token (X-User-Token)</label>
            <textarea
              value={userToken}
              onChange={e => setUserToken(e.target.value)}
              placeholder="Paste the JWT acquired from user login"
              rows={3}
              className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-code-sm font-code-sm text-on-surface focus:outline-none placeholder:text-outline-variant resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={e => setToolName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
              />
            </div>
            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Tool Endpoint</label>
              <input
                type="text"
                value={toolEndpoint}
                onChange={e => setToolEndpoint(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Parameters (JSON)</label>
            <textarea
              value={toolParams}
              onChange={e => setToolParams(e.target.value)}
              rows={3}
              className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-code-sm font-code-sm text-on-surface focus:outline-none resize-none font-code"
            />
          </div>

          <div className="flex gap-sm pt-sm">
            <button
              onClick={() => runCheck('dry')}
              className="flex-1 bg-surface-container-high border border-panel-border text-on-surface hover:bg-surface-bright font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg transition-colors"
            >
              Dry Run Check
            </button>
            <button
              onClick={() => runCheck('execute')}
              className="flex-1 bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              Full Execute
            </button>
          </div>
        </section>

        {/* RIGHT: Results Panel */}
        <section className="bg-surface border border-panel-border rounded-xl p-md shadow-sm flex flex-col h-full min-h-[460px]">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-md">
            Execution Result
          </h3>

          {!resultMode && !errorMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-lg text-on-surface-variant space-y-sm">
              <FlaskConical className="w-12 h-12 text-outline-variant" />
              <p className="text-body-sm font-body-sm">
                Run a test configuration to see the 4-check gateway results here.
              </p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-primary-container space-y-sm">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-label-caps font-label-caps">Executing gateway policy...</span>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex items-center justify-center text-error bg-error/5 border border-error/25 p-md rounded-lg h-fit text-body-sm font-body-sm mt-lg">
              {errorMsg}
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-md">
              <div className="flex justify-between items-center pb-sm border-b border-panel-border">
                <span className="text-body-md font-semibold text-on-surface">Gateway Decision</span>
                <span className={`inline-flex px-3 py-1 rounded text-label-caps font-label-caps font-bold border ${
                  resultData?.status === 'ALLOW'
                    ? 'bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border-secondary-fixed-dim'
                    : 'bg-[rgba(255,180,171,0.1)] text-error border-error'
                }`}>
                  {resultData?.status || 'UNKNOWN'}
                </span>
              </div>

              {resultMode === 'dry' ? (
                <div className="bg-surface-container-lowest border border-panel-border p-sm rounded-lg space-y-sm">
                  <div className="font-semibold text-body-sm text-on-surface">Validation Checks</div>
                  <div className="space-y-xs text-body-sm">
                    {resultData?.status === 'ALLOW' ? (
                      <div className="text-secondary-fixed-dim flex items-center gap-xs">
                        <CheckCircle className="w-4 h-4" />
                        All security checks passed.
                      </div>
                    ) : (
                      <div className="text-error flex items-start gap-xs">
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <div>Check {resultData?.check_failed} Failed</div>
                          <div className="text-xs text-on-surface-variant mt-1">{resultData?.message || resultData?.error}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-panel-border/30 pt-sm text-xs text-outline-variant space-y-1">
                    <div>Audit ID: <span className="font-code">{resultData?.audit_id}</span></div>
                    <div>Latency: <span className="font-code">{resultData?.latency_ms}ms</span></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-sm flex-1 flex flex-col">
                  <div className="space-y-xs flex-1 flex flex-col">
                    <span className="text-label-caps font-label-caps text-on-surface-variant">Tool Response / Output</span>
                    <textarea
                      readOnly
                      value={resultData?.status === 'ALLOW'
                        ? JSON.stringify(resultData?.result, null, 2)
                        : `DENIED: Check ${resultData?.check_failed} failed.\nReason: ${resultData?.message || resultData?.error}`
                      }
                      className="w-full flex-1 bg-surface-container-lowest border border-panel-border rounded-lg p-sm text-code-sm font-code-sm text-on-surface focus:ring-0 resize-none font-code min-h-[160px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-sm border-t border-panel-border pt-sm text-body-sm">
                    <div>
                      <span className="text-xs text-on-surface-variant block">Latency</span>
                      <span className="font-bold text-on-surface flex items-center gap-xs">
                        <Zap className="w-3.5 h-3.5 text-primary-container" />
                        {resultData?.latency_ms}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant block">Audit ID</span>
                      <span className="font-code text-on-surface block truncate" title={resultData?.audit_id}>
                        {resultData?.audit_id}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
