'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Lock, Mail, Users } from 'lucide-react';
import { api } from '@/lib/mock-api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgId, setOrgId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !orgId.trim()) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await api.register(email.trim(), password.trim(), orgId.trim());
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
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
          <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Create Account</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Register for your AgentAuth tenant organization.</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-sm bg-secondary-fixed-dim/20 border border-secondary-fixed-dim/30 text-secondary-fixed-dim p-sm rounded-lg text-body-sm font-body-sm flex gap-xs items-center">
            <span>Account created successfully! Redirecting to login...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-sm bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm flex gap-xs items-center animate-pulse-glow">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-sm">
          {/* Org ID input */}
          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Organization ID</label>
            <div className="relative">
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                placeholder="e.g. acme_corp"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg pl-lg pr-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>
          </div>

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
                placeholder="Min. 8 characters"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg pl-lg pr-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-xs">
            <label className="text-label-caps font-label-caps text-on-surface-variant block">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg pl-lg pr-sm py-2 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold py-2.5 rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-xs disabled:opacity-60 mt-md"
          >
            {loading ? 'Creating Account...' : 'Register'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-md pt-sm border-t border-panel-border text-center text-body-sm font-body-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-container hover:text-primary-fixed-dim transition-colors font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
