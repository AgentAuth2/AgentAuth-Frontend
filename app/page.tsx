'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Zap, Fingerprint, Lock, ArrowRight, Cpu } from 'lucide-react';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-md lg:px-xl py-sm border-b border-panel-border">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-container" />
          </div>
          <span className="text-headline-md font-headline-md font-bold text-primary-container tracking-tight">AgentAuth</span>
        </div>
        <div className="flex items-center gap-sm">
          <Link href="/contact" className="hidden sm:flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant hover:text-on-surface transition-colors">
            Documentation
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center gap-xs"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-label-caps font-label-caps text-on-surface-variant hover:text-on-surface transition-colors px-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center gap-xs"
              >
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-container-max mx-auto px-md lg:px-xl pt-xl lg:pt-[120px] pb-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-xs mb-sm">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse-glow" />
            <span className="text-label-caps font-label-caps text-primary-container">SECURITY INFRASTRUCTURE</span>
          </div>
          <h1 className="text-display font-display text-on-surface mb-md leading-tight">
            OAuth Infrastructure<br />for AI Agents
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-lg max-w-2xl leading-relaxed">
            Zero-user-data security middleware that enforces identity, scoped permissions,
            and data ownership on every AI agent tool call.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-xs bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-3 rounded-lg hover:bg-primary-fixed-dim transition-colors"
          >
            Book Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-container-max mx-auto px-md lg:px-xl pb-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <FeatureCard
            icon={<Fingerprint className="w-5 h-5" />}
            title="4 Security Checks"
            description="Agent auth, scope validation, user identity, and data ownership — enforced on every call."
          />
          <FeatureCard
            icon={<Lock className="w-5 h-5" />}
            title="Zero User Data"
            description="Gateway never stores, logs, or transmits user data. Hash-only audit trails."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="<10ms Gateway Latency"
            description="Sub-10ms request intercept with Redis-backed revocation and RSA signature verification."
          />
          <FeatureCard
            icon={<Cpu className="w-5 h-5" />}
            title="Dual Token Model"
            description="Agent Bearer Token + User Session JWT. Prevents cross-user data leaks by design."
          />
        </div>
      </section>

      {/* Gateway Flow Preview */}
      <section className="relative z-10 max-w-container-max mx-auto px-md lg:px-xl pb-xl">
        <div className="bg-surface border border-panel-border rounded-xl p-md lg:p-lg relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, #00e5ff 0%, transparent 60%)' }} />
          <div className="flex justify-between items-center mb-lg relative z-10">
            <h3 className="text-headline-md font-headline-md text-on-surface">How It Works</h3>
            <div className="bg-surface-container-highest border border-panel-border px-sm py-xs rounded">
              <span className="text-code-sm font-code-sm text-primary-container">POST /v1/gateway/execute</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-panel-border rounded-lg p-sm relative z-10 w-fit mb-lg">
            <div className="text-label-caps font-label-caps text-on-surface-variant mb-xs">Required Authorization Headers</div>
            <div className="text-code-sm font-code-sm text-on-surface mb-1">
              <span className="text-outline-variant">Authorization:</span> Bearer <span className="text-primary-container">{'{agent_token}'}</span>
            </div>
            <div className="text-code-sm font-code-sm text-on-surface">
              <span className="text-outline-variant">X-User-Token:</span> Bearer <span className="text-primary-container">{'{user_jwt}'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between relative z-10 px-md py-lg overflow-x-auto gap-sm">
            <FlowStep label="Tool Call" icon={<Shield className="w-5 h-5" />} />
            <FlowGate label="Agent RSA Signature & Redis Check" />
            <FlowGate label="Scope Engine Auth" />
            <FlowGate label="User Identity JWKS Verify" />
            <FlowGate label="Data Ownership Binding" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-container-max mx-auto px-md lg:px-xl pb-xl text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-xs bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-xl py-3 rounded-lg hover:bg-primary-fixed-dim transition-colors"
        >
          Get Started with AgentAuth
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-surface border border-panel-border rounded-lg p-sm relative overflow-hidden group hover:border-primary-container/30 transition-colors">
      <div className="absolute inset-0 bg-surface-container-high opacity-0 group-hover:opacity-10 transition-opacity" />
      <div className="flex justify-between items-start mb-sm relative z-10">
        <span className="text-label-caps font-label-caps text-on-surface-variant">{title}</span>
        <span className="text-primary-container">{icon}</span>
      </div>
      <p className="text-body-sm font-body-sm text-on-surface-variant relative z-10">{description}</p>
    </div>
  );
}

function FlowStep({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-sm flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-surface-container border border-panel-border flex items-center justify-center">
        <span className="text-primary-container">{icon}</span>
      </div>
      <span className="text-label-caps font-label-caps text-on-surface-variant text-center">{label}</span>
    </div>
  );
}

function FlowGate({ label }: { label: string }) {
  return (
    <>
      <div className="hidden lg:block flex-1 h-[2px] bg-outline-variant relative">
        <div className="absolute inset-0 flow-line" />
      </div>
      <div className="flex flex-col items-center gap-sm flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-background border border-panel-border flex items-center justify-center shadow-[0_0_8px_rgba(42,229,0,0.2)]">
          <Lock className="w-4 h-4 text-secondary-fixed-dim" />
        </div>
        <span className="text-label-caps font-label-caps text-on-surface text-center max-w-[100px]">{label}</span>
      </div>
    </>
  );
}
