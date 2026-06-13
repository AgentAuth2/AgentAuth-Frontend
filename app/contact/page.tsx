'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', company: '', email: '', framework: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-md lg:px-xl py-sm border-b border-panel-border">
        <Link href="/" className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-container" />
          </div>
          <span className="text-headline-md font-headline-md font-bold text-primary-container tracking-tight">AgentAuth</span>
        </Link>
      </nav>

      {/* Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-md py-lg">
        <div className="w-full max-w-[540px]">
          <div className="mb-lg">
            <Link href="/" className="inline-flex items-center gap-xs text-label-caps font-label-caps text-on-surface-variant hover:text-on-surface transition-colors mb-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-xs">Book a Demo</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">Tell us about your setup and we will get you started.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-panel border border-panel-border rounded-xl p-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container" />

            <div className="flex flex-col gap-sm mb-lg">
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Jane Smith"
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">Company</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Acme Corp"
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">Work Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="jane@acme.com"
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant mb-xs block">AI Framework Used</label>
                <select
                  value={form.framework}
                  onChange={set('framework')}
                  required
                  className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors appearance-none"
                >
                  <option value="">Select framework...</option>
                  <option value="langchain">LangChain</option>
                  <option value="crewai">CrewAI</option>
                  <option value="autogen">AutoGen</option>
                  <option value="openai-sdk">OpenAI Agents SDK</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="custom">Custom / Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold px-lg py-3 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-xs disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Request Demo'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-sm flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-label-caps font-label-caps text-outline-variant hover:text-on-surface-variant transition-colors"
            >
              Skip Contact
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
