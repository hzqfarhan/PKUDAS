'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { mockGetDayAvailability, mockBookAppointment } from '@/lib/mock-data';
import { formatDateDisplay, formatTime12h, isPastDate, todayDateStr } from '@/lib/utils/date';
import type { DayAvailability, TimeSlot } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dateStr = params.date as string;

  const [dayData, setDayData] = useState<DayAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (dateStr) {
      const data = mockGetDayAvailability(dateStr);
      setDayData(data);
    }
  }, [dateStr]);

  const handleBook = async () => {
    if (!user || !selectedSlot) {
      toast.error('Please log in to book an appointment');
      return;
    }

    setBooking(true);
    const result = mockBookAppointment(
      user.id,
      dateStr,
      selectedSlot.start_time,
      selectedSlot.end_time,
      notes || undefined
    );
    setBooking(false);

    if (result.error) {
      toast.error(result.error);
      setShowConfirm(false);
    } else {
      toast.success('Appointment booked successfully!');
      router.push('/my-appointments');
    }
  };

  if (!dateStr) return null;

  const past = isPastDate(dateStr);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft size={16} color="white" />
          Back to availability
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Book Appointment
        </h1>
        <p className="text-muted-foreground mt-1">
          {formatDateDisplay(dateStr)}
        </p>
      </div>

      {past && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-6">
          This date is in the past. You cannot book appointments for past dates.
        </div>
      )}

      {!user && (
        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8 text-center mb-6 shadow-sm">
          <p className="text-foreground-muted mb-4">Please sign in to book an appointment.</p>
          <Link href="/login" className="inline-block px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-fg text-sm font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      )}

      {dayData && dayData.totalSlots > 0 && !past ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-[24px] border border-glass-border bg-surface p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-success">{dayData.availableCount}</p>
              <p className="text-xs text-foreground-muted mt-0.5 uppercase tracking-wider">Available</p>
            </div>
            <div className="rounded-[24px] border border-glass-border bg-surface p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-destructive">{dayData.bookedCount}</p>
              <p className="text-xs text-foreground-muted mt-0.5 uppercase tracking-wider">Booked</p>
            </div>
            <div className="rounded-[24px] border border-glass-border bg-surface p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-foreground-muted opacity-80">{dayData.blockedCount}</p>
              <p className="text-xs text-foreground-muted mt-0.5 uppercase tracking-wider">Blocked</p>
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Select a time slot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {dayData.slots.map((slot) => {
                const isSelected = selectedSlot?.start_time === slot.start_time;
                const isAvailable = slot.status === 'available';

                return (
                  <button
                    key={slot.start_time}
                    disabled={!isAvailable || !user}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSlot(isSelected ? null : slot);
                        setShowConfirm(false);
                      }
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary bg-primary text-primary-fg shadow-md'
                        : isAvailable
                        ? 'border-glass-border bg-surface hover:border-primary hover:text-primary cursor-pointer'
                        : slot.status === 'booked'
                        ? 'border-destructive/10 bg-destructive/5 text-destructive cursor-not-allowed'
                        : slot.status === 'blocked'
                        ? 'border-glass-border bg-background cursor-not-allowed opacity-40'
                        : 'border-glass-border bg-background text-foreground-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="block">{formatTime12h(slot.start_time)}</span>
                    <span className="block text-[10px] mt-0.5 opacity-70">
                      {slot.status === 'available'
                        ? 'Open'
                        : slot.status === 'booked'
                        ? 'Booked'
                        : slot.status === 'blocked'
                        ? 'Blocked'
                        : 'Past'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Confirmation */}
          {selectedSlot && user && (
            <div className="mt-6 rounded-[24px] border border-primary/30 bg-primary/5 p-6 backdrop-blur-md shadow-sm">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle size={20} color="white" strokeWidth={2} />
                Confirm Booking
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm bg-surface/50 rounded-xl p-4 border border-glass-border">
                <div>
                  <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Date</p>
                  <p className="font-medium text-foreground">{formatDateDisplay(dateStr)}</p>
                </div>
                <div>
                  <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Time</p>
                  <p className="font-medium text-foreground">
                    {formatTime12h(selectedSlot.start_time)} – {formatTime12h(selectedSlot.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Patient</p>
                  <p className="font-medium text-foreground">{user.profile.full_name}</p>
                </div>
                <div>
                  <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-medium text-foreground">30 minutes</p>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
                  Notes <span className="text-foreground-muted font-normal">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-xl border border-glass-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  placeholder="e.g., tooth pain, cleaning, etc."
                />
              </div>

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Confirm & Book
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="px-8 py-2.5 rounded-full bg-success text-white text-sm font-semibold hover:brightness-95 transition-all shadow-sm disabled:opacity-50"
                  >
                    {booking ? 'Booking...' : '✓ Yes, book this slot'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-2.5 rounded-full border border-glass-border bg-surface text-sm font-medium hover:bg-glass hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : dayData?.totalSlots === 0 ? (
        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4 border border-glass-border shadow-sm">
            <XCircle size={32} color="white" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-lg">Clinic Closed</h3>
          <p className="text-sm text-foreground-muted">No appointments available on this day (weekend or holiday).</p>
        </div>
      ) : null}
    </div>
  );
}
