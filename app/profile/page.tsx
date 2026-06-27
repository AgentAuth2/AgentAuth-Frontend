'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, RefreshCw, KeyRound, LogOut } from 'lucide-react';
import { api, BASE_URL } from '@/lib/api';

interface UserData {
  user_id: string;
  email: string;
  org_id: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      


      const res = await fetch(`${BASE_URL}/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error();
      }
      const data = await res.json();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_sub');
      localStorage.removeItem('user_org');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');


      const res = await fetch(`${BASE_URL}/v1/auth/password/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Password change failed.");
      }

      setSuccess("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('access_token');


    try {
      await fetch(`${BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}

    localStorage.removeItem('access_token');
    localStorage.removeItem('user_sub');
    localStorage.removeItem('user_org');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary-container">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-sm text-label-caps font-label-caps">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative py-lg px-sm">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-[560px] mx-auto space-y-md">
        
        {/* Navigation back to dashboard (if admin) or back home */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="inline-flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-xs px-sm py-2 rounded text-label-caps font-label-caps text-error border border-error/30 hover:bg-error/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <section className="bg-surface-container-low border border-panel-border rounded-xl p-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary-container" />
          
          <div className="flex items-center gap-sm mb-md pb-sm border-b border-panel-border">
            <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-container" />
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">User Profile</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Tenant Organization: {user?.org_id}</p>
            </div>
          </div>

          <div className="space-y-sm text-body-sm">
            <div className="flex justify-between py-xs border-b border-panel-border/30">
              <span className="text-on-surface-variant font-medium">User ID</span>
              <span className="font-code text-on-surface">{user?.user_id}</span>
            </div>
            <div className="flex justify-between py-xs border-b border-panel-border/30">
              <span className="text-on-surface-variant font-medium">Email Address</span>
              <span className="font-code text-on-surface">{user?.email}</span>
            </div>
            <div className="flex justify-between py-xs">
              <span className="text-on-surface-variant font-medium">Status</span>
              <span className="inline-flex px-2 py-0.5 rounded text-label-caps font-label-caps bg-[rgba(42,229,0,0.1)] text-secondary-fixed-dim border border-secondary-fixed-dim">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Change Password Card */}
        <section className="bg-surface-container-low border border-panel-border rounded-xl p-md shadow-2xl relative">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-md flex items-center gap-xs">
            <KeyRound className="w-5 h-5 text-primary-container" />
            Update Password
          </h3>

          {error && (
            <div className="mb-sm bg-error-container/20 border border-error-container/30 text-error p-sm rounded-lg text-body-sm font-body-sm animate-pulse-glow">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-sm bg-secondary-fixed-dim/20 border border-secondary-fixed-dim/30 text-secondary-fixed-dim p-sm rounded-lg text-body-sm font-body-sm">
              {success}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-sm">
            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-label-caps font-label-caps text-on-surface-variant block">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-panel-border rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-60"
            >
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
