'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, LayoutDashboard, Cpu, Lock, ScrollText,
  Settings, HelpCircle, FileText, Menu, X, Plus, User, LogOut, Terminal, Heart, Building, FileSearch
} from 'lucide-react';
import { RegisterAgentModal } from '@/components/dashboard/register-agent-modal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Gateway Overview', icon: LayoutDashboard },
  { href: '/dashboard/analyzer', label: 'Code Analyzer', icon: FileSearch },
  { href: '/dashboard/agents', label: 'Agent Registry', icon: Cpu },
  { href: '/dashboard/scopes', label: 'Role & Scope Engine', icon: Lock },
  { href: '/dashboard/gateway/console', label: 'Test Console', icon: Terminal },
  { href: '/dashboard/audit', label: 'Audit Logs', icon: ScrollText },
  { href: '/dashboard/health', label: 'System Health', icon: Heart },
  { href: '/dashboard/settings', label: 'Admin Config', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com'
    : 'http://localhost:8000');

    fetch(`${BASE_URL}/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setUserEmail(data.email);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_sub');
        localStorage.removeItem('user_org');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    const token = localStorage.getItem('access_token');
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://agentauthbackend.onrender.com'
    : 'http://localhost:8000');

    fetch(`${BASE_URL}/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});

    localStorage.removeItem('access_token');
    localStorage.removeItem('user_sub');
    localStorage.removeItem('user_org');
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary-container">
        <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="ml-xs text-label-caps font-label-caps">Checking Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-sm left-sm z-30 w-10 h-10 bg-panel border border-panel-border rounded-lg flex items-center justify-center text-on-surface"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-surface-container-low border-r border-panel-border
        flex flex-col p-sm gap-xs transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-lg px-sm pt-xs">
          <Link href="/" className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-container" />
            </div>
            <span className="text-headline-md font-headline-md font-bold text-primary-container tracking-tight">AgentAuth</span>
          </Link>
          <p className="text-on-surface-variant text-body-sm font-body-sm mt-1 pl-[40px]">v1.0.4-stable</p>
        </div>

        <nav className="flex-1 flex flex-col gap-xs">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-sm px-sm py-xs rounded-lg transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)] scale-[0.99]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-label-caps font-label-caps">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-sm">
          <button
            onClick={() => setRegisterOpen(true)}
            className="w-full bg-primary-container text-on-primary-container px-sm py-xs rounded font-bold text-body-sm font-body-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
          >
            <Plus className="w-4 h-4" />
            Register New Agent
          </button>
          
          <div className="border-t border-panel-border pt-sm flex flex-col gap-xs">
            {userEmail && (
              <div className="px-sm py-xs flex items-center gap-xs text-body-sm text-on-surface-variant">
                <div className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-xs font-semibold uppercase">
                  {userEmail.charAt(0)}
                </div>
                <span className="truncate max-w-[150px]">{userEmail}</span>
              </div>
            )}
            <Link href="/profile" className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:text-on-surface transition-colors">
              <User className="w-[18px] h-[18px]" />
              <span className="text-body-sm font-body-sm">My Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-sm px-sm py-xs text-error hover:bg-error/10 rounded-lg text-left transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span className="text-body-sm font-body-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-md lg:p-xl overflow-y-auto min-h-screen">
        <div className="pt-xs md:pt-0">
          {children}
        </div>
      </main>

      <RegisterAgentModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
