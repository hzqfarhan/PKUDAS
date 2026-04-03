'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth/auth-context';
import { registerServiceWorker } from '@/lib/utils/register-sw';
import { Sidebar } from '@/components/layout/sidebar';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';
import { WhatsAppFAB } from '@/components/layout/whatsapp-fab';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <OnboardingGuard>
        <div className="flex w-full min-h-screen relative">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 p-4 md:p-8 shrink-0 relative z-0">{children}</main>
            <footer className="py-6 mt-auto shrink-0 border-t border-glass-border/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-foreground-muted">
                <p>© {new Date().getFullYear()} Pusat Kesihatan Universiti, UTHM. All rights reserved.</p>
                <p className="mt-1 flex items-center justify-center gap-1 font-medium">
                  <span>e-Dent System</span>
                </p>
              </div>
            </footer>
          </div>
        </div>
        <WhatsAppFAB />
        <Toaster position="top-right" richColors closeButton />
      </OnboardingGuard>
    </AuthProvider>
  );
}
