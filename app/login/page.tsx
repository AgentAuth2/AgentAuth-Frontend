'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await api.login(email.trim(), password.trim());
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-center items-center px-sm">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative z-10 w-full max-w-[440px] bg-surface-container-low border border-panel-border rounded-xl p-md shadow-2xl overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary-container" />

        {/* Logo and Headings */}
        <div className="flex flex-col items-center mb-md text-center">
          <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-xs">
            <Shield className="w-5 h-5 text-primary-container" />
          </div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Welcome Back</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Sign in to manage your AgentAuth security settings.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-sm bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm flex gap-xs items-center animate-pulse-glow">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-sm">
          {/* Email input */}
          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Email Address</label>
            <div className="relative">
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg pl-lg pr-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Password</label>
            <div className="relative">
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg pl-lg pr-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold py-2.5 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-xs disabled:opacity-60 mt-md"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-md pt-sm border-t border-panel-border text-center text-body-sm font-body-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-container hover:text-primary-fixed-dim transition-colors font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
