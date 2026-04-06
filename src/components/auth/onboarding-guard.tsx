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
    if (loading) return;

    // No user logged in — skip all checks, just render
    if (!user) {
      setIsVerifying(false);
      return;
    }

    // User is logged in but hasn't completed onboarding
    if (!user.profile.matric_number && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    // User already onboarded but on onboarding page
    if (user.profile.matric_number && pathname === '/onboarding') {
      router.push('/');
      return;
    }

    setIsVerifying(false);
  }, [user, loading, pathname, router]);

  // Show nothing while auth is loading
  if (loading) {
    return null;
  }

  // For unauthenticated users or public routes, render immediately
  if (!user || isPublicRoute) {
    return <>{children}</>;
  }

  // For authenticated users still verifying onboarding status
  if (isVerifying) {
    return null;
  }

  // Block render if user needs onboarding and isn't on onboarding page
  if (!user.profile.matric_number && pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}

