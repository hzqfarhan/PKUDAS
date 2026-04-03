'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  // Allow access to public routes
  const isPublicRoute = ['/login', '/signup', '/offline'].includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (user && !user.profile.matric_number && pathname !== '/onboarding') {
        // Needs onboarding
        router.push('/onboarding');
      } else if (user && user.profile.matric_number && pathname === '/onboarding') {
        // Already onboarded
        router.push('/');
      } else {
        setIsVerifying(false);
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || isVerifying) {
    return null; // or a loading spinner
  }

  // If user needs onboarding and isn't on onboarding page, render nothing to avoid flash
  if (user && !user.profile.matric_number && pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}
