'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export function Sidebar() {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminOrStaff = isAdmin || isStaff;

  const navLinks = user
    ? [
        { href: '/', label: 'Availability', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', show: true },
        { href: '/my-appointments', label: 'My Appointments', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', show: !isAdminOrStaff },
        { href: '/admin', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', show: isAdminOrStaff },
        { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', show: true },
      ].filter((l) => l.show)
    : [];

  useEffect(() => {
    const saved = localStorage.getItem('edent_sidebar_collapsed');
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem('edent_sidebar_collapsed', JSON.stringify(!isCollapsed));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-glass backdrop-blur-xl border-r border-glass-border shadow-sm">
      <div className={`p-4 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <Image src="/branding/uthm-logo.png" alt="UTHM Logo" width={40} height={40} className="object-contain" priority />
          </div>
          {!isCollapsed && (
             <div className="flex flex-col">
               <span className="font-bold text-foreground text-xl tracking-tight">e-Dent</span>
               <span className="text-[10px] text-foreground-muted uppercase tracking-wider">PKU UTHM Clinic</span>
             </div>
          )}
        </Link>
        <button className="hidden md:block text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-opacity" onClick={toggleSidebar}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isCollapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
          </svg>
        </button>
      </div>

      <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive ? 'bg-primary text-primary-fg shadow-md' : 'text-foreground-muted hover:bg-glass-strong hover:text-foreground'
              }`}
              title={isCollapsed ? link.label : undefined}
            >
              <svg className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-glass-border">
        {user ? (
          <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''} gap-3`}>
            {!isCollapsed && (
              <div className="text-left px-2">
                <p className="text-sm font-semibold text-foreground truncate">{user.profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate uppercase">{user.profile.role}</p>
              </div>
            )}
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className={`flex items-center justify-center text-sm font-medium rounded-xl border border-glass-border bg-glass-strong hover:bg-destructive hover:text-primary-fg hover:border-destructive transition-colors ${
                isCollapsed ? 'p-2' : 'px-4 py-2 w-full gap-2'
              }`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <>
                <Link href="/login" className="w-full px-4 py-2 text-center text-sm font-medium rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-fg transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="w-full px-4 py-2 text-center text-sm font-medium rounded-xl bg-primary text-primary-fg shadow-sm hover:shadow-md transition-shadow">
                  Sign up
                </Link>
              </>
            )}
            {isCollapsed && (
               <Link href="/login" title="Login" className="p-2 flex justify-center text-primary bg-primary/10 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
               </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-glass backdrop-blur-xl border-b border-glass-border px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/branding/uthm-logo.png" alt="UTHM Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">e-Dent</span>
        </Link>
        <button
          className="p-2 rounded-xl border border-glass-border bg-glass-strong focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:block sticky top-0 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} z-30 shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[280px] max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
