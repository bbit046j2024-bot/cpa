'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface UserSession {
  name: string;
  username: string;
  role: string;
}

const navItems = [
  { label: 'Dashboard',         href: '/admin',                icon: LayoutDashboard, group: 'main' },
  { label: 'Supporters',        href: '/admin/supporters',     icon: Users,           group: 'main' },
  { label: 'Communications',    href: '/admin/communications', icon: MessageSquare,   group: 'main' },
  { label: 'Activities',        href: '/admin/activities',     icon: Calendar,        group: 'main' },
  { label: 'Reports',           href: '/admin/reports',        icon: BarChart3,       group: 'tools' },
  { label: 'User Management',   href: '/admin/users',          icon: UserCog,         group: 'tools' },
  { label: 'Settings',          href: '/admin/settings',       icon: Settings,        group: 'tools' },
];

const pageTitle: Record<string, string> = {
  '/admin':                 'Dashboard',
  '/admin/supporters':      'Supporter Directory',
  '/admin/communications':  'Communications Centre',
  '/admin/activities':      'Campaign Activities',
  '/admin/reports':         'Reports & Analytics',
  '/admin/users':           'User Management',
  '/admin/settings':        'Settings',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [currentUser,  setCurrentUser]  = useState<UserSession | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const stored = localStorage.getItem('cpa_user');
    if (!stored) {
      const demo = { name: 'Campaign Administrator', username: 'admin', role: 'admin' };
      localStorage.setItem('cpa_user', JSON.stringify(demo));
      setCurrentUser(demo);
    } else {
      try { setCurrentUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('cpa_user');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const title = pageTitle[pathname] ?? 'Admin';
  const mainNav  = navItems.filter(n => n.group === 'main');
  const toolsNav = navItems.filter(n => n.group === 'tools');

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col
        bg-campaign-deepGreen
        transform transition-transform duration-250 ease-in-out
        md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0 overflow-hidden p-1">
              <img src="/images/cpa-logo.png" alt="CPA" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-heading font-extrabold text-sm leading-tight">ELISHA ADERA</p>
              <p className="text-campaign-gold text-[10px] font-bold uppercase tracking-widest">Super Delegate 26/27</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-[10px] font-semibold">
            <GraduationCap className="w-3 h-3" />
            <span>Dept. Management Science • TUM</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

          <div>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Main</p>
            <div className="space-y-0.5">
              {mainNav.map(item => {
                const Icon     = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${isActive
                        ? 'bg-white/15 text-white shadow-sm border border-white/10'
                        : 'text-white/60 hover:bg-white/8 hover:text-white/90'}
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-campaign-gold' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Tools</p>
            <div className="space-y-0.5">
              {toolsNav.map(item => {
                const Icon     = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${isActive
                        ? 'bg-white/15 text-white shadow-sm border border-white/10'
                        : 'text-white/60 hover:bg-white/8 hover:text-white/90'}
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-campaign-gold' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* User chip */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/8 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-campaign-gold text-campaign-deepGreen font-extrabold text-sm flex items-center justify-center flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{currentUser?.name || 'Administrator'}</p>
              <p className="text-white/40 text-[10px] uppercase font-semibold truncate">{currentUser?.role || 'admin'}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold text-white/50 hover:text-white border border-white/15 rounded-lg hover:bg-white/8 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 px-3 py-2 text-[11px] font-semibold text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-5 md:px-8 py-0 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
              <span className="font-bold text-campaign-deepGreen">{title}</span>
            </div>
          </div>

          {/* Right: role badge + public site */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-campaign-lightGreen text-campaign-deepGreen text-[11px] font-bold border border-campaign-primaryGreen/20">
              <ShieldCheck className="w-3.5 h-3.5 text-campaign-primaryGreen" />
              <span>{currentUser?.role?.toUpperCase() || 'ADMIN'}</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-campaign-primaryGreen hover:bg-campaign-deepGreen rounded-lg transition-all"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
