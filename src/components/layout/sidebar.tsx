'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Calendar, 
  ClipboardList, 
  LayoutDashboard, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  LogIn
} from 'lucide-react';

export function Sidebar() {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminOrStaff = isAdmin || isStaff;

  const navLinks = user
    ? [
        { href: '/', label: 'Availability', icon: Calendar, show: true },
        { href: '/my-appointments', label: 'My Appointments', icon: ClipboardList, show: !isAdminOrStaff },
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, show: isAdminOrStaff },
        { href: '/profile', label: 'Profile', icon: User, show: true },
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
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`shrink-0 flex items-center justify-center ${isCollapsed ? 'h-8' : 'h-10'}`}>
            <Image src="/branding/uthm-logo.png" alt="UTHM Logo" width={120} height={40} className="object-contain w-auto h-full drop-shadow-sm group-hover:drop-shadow-md transition-all" priority />
          </div>
          {!isCollapsed && (
             <div className="flex flex-col border-l border-glass-border pl-3">
               <span className="font-bold text-foreground text-xl tracking-tight leading-tight">e-Dent</span>
               <span className="text-[10px] text-foreground-muted uppercase tracking-wider">PKU Clinic</span>
             </div>
          )}
        </Link>
        <button className="hidden md:block text-white/50 hover:text-[#FFFFFF] transition-opacity" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={20} color="#FFFFFF" /> : <ChevronLeft size={20} color="#FFFFFF" />}
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
              <link.icon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} strokeWidth={2.5} color="#FFFFFF" />
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
              <LogOut className="w-5 h-5" strokeWidth={2} color="#FFFFFF" />
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
               <Link href="/login" title="Login" className="p-2 flex justify-center text-[#FFFFFF] bg-primary/20 rounded-xl">
                  <LogIn className="w-5 h-5" strokeWidth={2} color="#FFFFFF" />
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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 flex items-center justify-center">
            <Image src="/branding/uthm-logo.png" alt="UTHM Logo" width={100} height={32} className="object-contain w-auto h-full drop-shadow-sm group-hover:drop-shadow-md transition-all" priority />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight border-l border-glass-border pl-3 group-hover:text-primary transition-colors">e-Dent</span>
        </Link>
        <button
          className="p-2 rounded-xl border border-glass-border bg-glass-strong focus:outline-none focus:ring-2 focus:ring-primary text-[#FFFFFF]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} color="#FFFFFF" /> : <Menu size={24} color="#FFFFFF" />}
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
