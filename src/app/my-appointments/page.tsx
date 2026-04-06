'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { mockGetAppointments, mockCancelAppointment } from '@/lib/mock-data';
import { formatDateDisplay, formatTime12h, todayDateStr } from '@/lib/utils/date';
import type { Appointment } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-info/20 text-info border border-info/30',
  confirmed: 'bg-success/20 text-success border border-success/30',
  completed: 'bg-surface text-foreground-muted border border-glass-border',
  cancelled: 'bg-destructive/20 text-destructive border border-destructive/30',
  no_show: 'bg-warning/20 text-warning border border-warning/30',
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadAppointments();
  }, [user]);

  const loadAppointments = () => {
    if (!user) return;
    const appts = mockGetAppointments({ patientId: user.id });
    setAppointments(appts);
  };

  const handleCancel = (appointmentId: string) => {
    if (!user) return;
    const result = mockCancelAppointment(appointmentId, user.id, cancelReason || undefined);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Appointment cancelled');
      setCancelConfirm(null);
      setCancelReason('');
      loadAppointments();
    }
  };

  const today = todayDateStr();
  const upcoming = appointments.filter(
    (a) => a.appointment_date >= today && a.status !== 'cancelled'
  );
  const past = appointments.filter(
    (a) => a.appointment_date < today || a.status === 'cancelled'
  );

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-foreground-muted mt-1">Manage your dental appointments</p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-fg text-sm font-semibold transition-colors shadow-sm"
        >
          Book New
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4 border border-glass-border shadow-sm">
              <Calendar size={32} color="white" strokeWidth={1.5} />
            </div>
            <p className="text-foreground-muted">No upcoming appointments.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Browse available slots →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appt) => (
              <div key={appt.id} className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 shadow-sm hover:-translate-y-1 transition-transform duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                      <Clock size={24} color="white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{formatDateDisplay(appt.appointment_date)}</p>
                      <p className="text-sm text-foreground-muted">
                        {formatTime12h(appt.start_time)} – {formatTime12h(appt.end_time)}
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-foreground-muted mt-2 bg-surface p-2 rounded-lg border border-glass-border inline-block">📝 {appt.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${statusColors[appt.status]}`}>
                      {appt.status.replace('_', ' ')}
                    </span>
                    {(appt.status === 'booked' || appt.status === 'confirmed') && (
                      <>
                        {cancelConfirm === appt.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Reason (optional)"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-32 rounded-full border border-glass-border bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="px-4 py-1.5 rounded-full bg-destructive text-white text-xs font-semibold hover:brightness-95 transition-all shadow-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setCancelConfirm(null); setCancelReason(''); }}
                              className="px-4 py-1.5 rounded-full border border-glass-border text-xs font-medium bg-surface hover:bg-glass transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirm(appt.id)}
                            className="px-4 py-1.5 rounded-full border border-destructive/50 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Appointments */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-foreground-muted" />
          Past & Cancelled
        </h2>
        {past.length === 0 ? (
          <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-sm p-6 text-center shadow-sm">
            <p className="text-foreground-muted text-sm">No past appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((appt) => (
              <div key={appt.id} className="rounded-xl border border-glass-border bg-surface/40 p-4 opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDateDisplay(appt.appointment_date)}</p>
                    <p className="text-xs text-foreground-muted">
                      {formatTime12h(appt.start_time)} – {formatTime12h(appt.end_time)}
                    </p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[appt.status]}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </div>
                {appt.cancelled_reason && (
                  <p className="text-xs text-foreground-muted mt-2 bg-background p-2 rounded-lg border border-glass-border inline-block">Reason: {appt.cancelled_reason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
