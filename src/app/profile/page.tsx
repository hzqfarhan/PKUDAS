'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { mockUpdateProfile, mockGetAppointments } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDateDisplay, formatTime12h, todayDateStr } from '@/lib/utils/date';
import type { Appointment } from '@/types/database';
import Link from 'next/link';
import { User, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, refreshSession } = useAuth();
  const router = useRouter();

  const [matricNumber, setMatricNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [affiliationType, setAffiliationType] = useState<'student' | 'uthm_staff'>('student');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && user.profile) {
      setMatricNumber(user.profile.matric_number || '');
      setFaculty(user.profile.faculty || '');
      setAffiliationType((user.profile.affiliation_type as 'student' | 'uthm_staff') || 'student');
      setPhone(user.profile.phone || '');
      
      const appts = mockGetAppointments({ patientId: user.id });
      const upcoming = appts.filter(a => a.appointment_date >= todayDateStr() && a.status !== 'cancelled');
      setUpcomingAppointments(upcoming);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) throw new Error('Not logged in');
      
      const updated = mockUpdateProfile(user.id, {
        matric_number: matricNumber,
        faculty,
        affiliation_type: affiliationType,
        phone: phone || null,
      });

      if (!updated) throw new Error('Failed to update profile');
      
      refreshSession();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-foreground-muted mt-1">Manage your personal information</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User size={20} color="white" strokeWidth={2} />
              Personal Details
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-primary hover:underline px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Full Name</label>
               <p className="font-medium text-foreground py-1">{user.profile.full_name}</p>
            </div>
            <div>
               <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</label>
               <p className="font-medium text-foreground py-1">{user.profile.email}</p>
            </div>
          
            {isEditing ? (
              <>
                <div className="pt-2 border-t border-glass-border mt-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Affiliation Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
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
                    placeholder="e.g. FSKTM"
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
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                        setIsEditing(false);
                        setMatricNumber(user.profile.matric_number || '');
                        setFaculty(user.profile.faculty || '');
                        setAffiliationType((user.profile.affiliation_type as 'student' | 'uthm_staff') || 'student');
                        setPhone(user.profile.phone || '');
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            ) : (
                <div className="space-y-4 pt-2 border-t border-glass-border">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Affiliation</label>
                    <p className="font-medium text-foreground py-1">
                      {user.profile.affiliation_type === 'uthm_staff' ? 'UTHM Staff' : 'Student'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Matric / Staff ID</label>
                    <p className="font-medium text-foreground py-1">{user.profile.matric_number || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Faculty / Dept</label>
                    <p className="font-medium text-foreground py-1">{user.profile.faculty || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</label>
                    <p className="font-medium text-foreground py-1">{user.profile.phone || '-'}</p>
                  </div>
                </div>
            )}
          </form>
        </div>
        
        {/* Current Bookings */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Calendar size={20} color="white" strokeWidth={2} />
              Current Bookings
            </h2>
            
            {upcomingAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-foreground-muted mb-4">You have no upcoming appointments.</p>
                  <Link href="/" className="px-4 py-2 inline-block rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">
                    Book Now
                  </Link>
                </div>
            ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 rounded-xl border border-border bg-background">
                      <p className="font-semibold text-primary">{formatDateDisplay(appt.appointment_date)}</p>
                      <p className="text-sm text-foreground mt-1 font-medium">
                        {formatTime12h(appt.start_time)} – {formatTime12h(appt.end_time)}
                      </p>
                      <div className="mt-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-info/20 text-info border border-info/30">
                          {appt.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link href="/my-appointments" className="text-sm font-medium text-primary hover:underline block mt-4 text-center">
                      Manage Appointments
                  </Link>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
