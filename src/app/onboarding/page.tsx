'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { mockUpdateProfile } from '@/lib/mock-data';

export default function OnboardingPage() {
  const { user, loading, refreshSession } = useAuth();
  const router = useRouter();

  const [matricNumber, setMatricNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [affiliationType, setAffiliationType] = useState<'student' | 'uthm_staff'>('student');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile.matric_number && user.profile.faculty) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user) throw new Error('Not logged in');
      if (!matricNumber || !faculty) throw new Error('Please fill in all required fields');

      // Update mock profile
      const updated = mockUpdateProfile(user.id, {
        matric_number: matricNumber,
        faculty,
        affiliation_type: affiliationType,
        phone: phone || null,
      });

      if (!updated) throw new Error('Failed to update profile');

      // Update auth context state to reflect changes instead of hard reload which resets mock memory
      refreshSession();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mt-2">We need a few more details before you can book appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4 relative z-10 overflow-hidden before:absolute before:inset-0 before:-z-10 before:bg-glass before:backdrop-blur-xl">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Affiliation Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="affiliation"
                    value="student"
                    checked={affiliationType === 'student'}
                    onChange={() => setAffiliationType('student')}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="affiliation"
                    value="uthm_staff"
                    checked={affiliationType === 'uthm_staff'}
                    onChange={() => setAffiliationType('uthm_staff')}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm text-foreground">UTHM Staff</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="matricNumber" className="block text-sm font-medium text-foreground mb-1.5">
                Matric Number / Staff ID <span className="text-destructive">*</span>
              </label>
              <input
                id="matricNumber"
                type="text"
                required
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                placeholder={affiliationType === 'student' ? 'e.g. AI220156' : 'e.g. 123456'}
              />
            </div>

            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-foreground mb-1.5">
                Faculty / Department <span className="text-destructive">*</span>
              </label>
              <input
                id="faculty"
                type="text"
                required
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                placeholder="e.g. FSKTM / PKU"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                placeholder="e.g. 0123456789"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-full shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
