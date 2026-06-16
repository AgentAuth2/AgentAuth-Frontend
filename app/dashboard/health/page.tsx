'use client';

import { useEffect, useState } from 'react';
import { Heart, Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Database, ShieldAlert } from 'lucide-react';

interface HealthStatus {
  status: string;
  database: string;
  redis: string;
}

interface GatewayMetrics {
  total_calls: number;
  allowed_calls: number;
  denied_calls: number;
  avg_latency_ms: number;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);

  const BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://${window.location.host.replace('3000', '8000')}`
    : 'http://localhost:8000';

  const loadHealthData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch Health
      const healthRes = await fetch(`${BASE_URL}/v1/health/ready`);
      const healthData = await healthRes.json();
      setHealth(healthData);

      // Fetch Audit Metrics
      const metricsRes = await fetch(`${BASE_URL}/v1/audit/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (err) {
      console.error("Failed to load health metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(() => {
      setPollingCount(prev => prev + 1);
    }, 30000); // 30s poll interval

    return () => clearInterval(interval);
  }, [pollingCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-sm text-primary-container">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-label-caps font-label-caps">Loading Health metrics...</span>
        </div>
      </div>
    );
  }

  const isDBConnected = health?.database === 'ok';
  const isRedisConnected = health?.redis === 'ok' || health?.redis?.includes('ok');
  const isGatewayHealthy = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <div className="space-y-md">
      <header className="flex justify-between items-end mb-lg border-b border-panel-border pb-sm">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">System Health Dashboard</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Real-time telemetry and service status monitoring. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button
          onClick={loadHealthData}
          className="flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant hover:text-on-surface transition-colors border border-panel-border px-sm py-1 rounded bg-surface"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refreshed
        </button>
      </header>

      {/* Health Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
        
        {/* Gateway Health */}
        <div className="bg-surface border border-panel-border rounded-xl p-md shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${isGatewayHealthy ? 'bg-secondary-fixed-dim' : 'bg-error'}`} />
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Gateway Status</span>
            <Server className={`w-5 h-5 ${isGatewayHealthy ? 'text-secondary-fixed-dim' : 'text-error'}`} />
          </div>
          <div className="text-headline-lg font-headline-lg text-on-surface mb-1">
            {isGatewayHealthy ? 'Operational' : 'Issues Detected'}
          </div>
          <div className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
            {isGatewayHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-secondary-fixed-dim" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-error" />
            )}
            Liveness & readiness checks pass.
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-surface border border-panel-border rounded-xl p-md shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${isDBConnected ? 'bg-secondary-fixed-dim' : 'bg-error'}`} />
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant">SQL Database</span>
            <Database className={`w-5 h-5 ${isDBConnected ? 'text-secondary-fixed-dim' : 'text-error'}`} />
          </div>
          <div className="text-headline-lg font-headline-lg text-on-surface mb-1">
            {isDBConnected ? 'Connected' : 'Offline'}
          </div>
          <div className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
            {isDBConnected ? (
              <CheckCircle2 className="w-4 h-4 text-secondary-fixed-dim" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-error" />
            )}
            SQLite database active.
          </div>
        </div>

        {/* Redis / Cache Health */}
        <div className="bg-surface border border-panel-border rounded-xl p-md shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${isRedisConnected ? 'bg-secondary-fixed-dim' : 'bg-error'}`} />
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Revocation Cache</span>
            <Heart className={`w-5 h-5 ${isRedisConnected ? 'text-secondary-fixed-dim' : 'text-error'}`} />
          </div>
          <div className="text-headline-lg font-headline-lg text-on-surface mb-1">
            {isRedisConnected ? 'Active' : 'Offline'}
          </div>
          <div className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
            {isRedisConnected ? (
              <CheckCircle2 className="w-4 h-4 text-secondary-fixed-dim" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-error" />
            )}
            {health?.redis || 'Cache operational'}
          </div>
        </div>

      </section>

      {/* Metrics Row */}
      <section className="bg-surface border border-panel-border rounded-xl p-md shadow-sm">
        <h3 className="text-headline-md font-headline-md text-on-surface mb-md flex items-center gap-xs">
          <Activity className="w-5 h-5 text-primary-container" />
          Gateway Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-body-sm">
          <div className="bg-surface-container-lowest border border-panel-border p-sm rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-xs">Total Requests</span>
            <span className="text-headline-md font-headline-md text-on-surface font-bold">
              {metrics?.total_calls || 0}
            </span>
          </div>
          
          <div className="bg-surface-container-lowest border border-panel-border p-sm rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-xs">Success Operations</span>
            <span className="text-headline-md font-headline-md text-secondary-fixed-dim font-bold">
              {metrics?.allowed_calls || 0}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-panel-border p-sm rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-xs">Blocked Threats</span>
            <span className="text-headline-md font-headline-md text-error font-bold flex items-center gap-xs">
              <ShieldAlert className="w-5 h-5" />
              {metrics?.denied_calls || 0}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-panel-border p-sm rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-xs">Average Latency</span>
            <span className="text-headline-md font-headline-md text-primary-container font-bold">
              {metrics?.avg_latency_ms?.toFixed(1) || 0} ms
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
