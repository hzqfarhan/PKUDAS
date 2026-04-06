'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
