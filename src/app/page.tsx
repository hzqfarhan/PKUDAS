'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { mockGetDayAvailability } from '@/lib/mock-data';
import { getWeekDates, getWeekRange, formatDateShort, formatDayName, formatTime12h, todayDateStr, addWeeks, isPastDate } from '@/lib/utils/date';
import type { DayAvailability, TimeSlot } from '@/types/database';

function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-green-500/80" />
        <span className="text-muted-foreground">Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-yellow-500/80" />
        <span className="text-muted-foreground">Limited</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-red-500/80" />
        <span className="text-muted-foreground">Full</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-gray-400/80" />
        <span className="text-muted-foreground">Blocked</span>
      </div>
    </div>
  );
}

function DayCard({ day, isToday }: { day: DayAvailability; isToday: boolean }) {
  const colorClass =
    day.occupancyLevel === 'available'
      ? 'slot-available'
      : day.occupancyLevel === 'limited'
      ? 'slot-limited'
      : 'slot-full';

  const past = isPastDate(day.date) && !isToday;

  return (
    <Link
      href={past ? '#' : `/book/${day.date}`}
      className={`block rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-5 shadow-sm transition-all ${
        past ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-md hover:bg-glass-strong cursor-pointer'
      } ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
    >
      <div className="text-center mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {formatDayName(day.date)}
        </p>
        <p className="text-lg font-bold text-foreground">{formatDateShort(day.date)}</p>
        {isToday && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
            TODAY
          </span>
        )}
      </div>

      {day.totalSlots === 0 ? (
        <div className="text-center py-3 text-xs text-muted-foreground">Closed</div>
      ) : (
        <>
          {/* Mini status bar */}
          <div className="flex gap-0.5 mb-3 h-2 rounded-full overflow-hidden bg-muted">
            {day.bookedCount > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(day.bookedCount / day.totalSlots) * 100}%` }}
              />
            )}
            {day.blockedCount > 0 && (
              <div
                className="bg-gray-400 transition-all"
                style={{ width: `${(day.blockedCount / day.totalSlots) * 100}%` }}
              />
            )}
            {day.availableCount > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(day.availableCount / day.totalSlots) * 100}%` }}
              />
            )}
          </div>

          <div className={`rounded-lg border px-3 py-2 text-center ${colorClass}`}>
            <span className="text-2xl font-bold">{day.availableCount}</span>
            <span className="text-xs block mt-0.5">slots available</span>
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>{day.bookedCount} booked</span>
            <span>{day.blockedCount} blocked</span>
          </div>
        </>
      )}
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const today = todayDateStr();
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const refDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const weekDates = getWeekDates(refDate);
  const weekRange = getWeekRange(refDate);

  const loadWeek = useCallback(() => {
    setLoading(true);
    const days = weekDates.map((d) => mockGetDayAvailability(d));
    setWeekDays(days);
    setLoading(false);
  }, [weekOffset]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
          Live Availability
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          e-Dent
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          View real-time slot availability and book your PKU UTHM dental appointment in seconds.
        </p>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {formatDateShort(weekRange.start)} – {formatDateShort(weekRange.end)}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-primary hover:underline mt-0.5"
            >
              Go to current week
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="mb-6 flex justify-center">
        <StatusLegend />
      </div>

      {/* Week Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 animate-pulse h-48 bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <DayCard key={day.date} day={day} isToday={day.date === today} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 hover:-translate-y-1 transition-transform duration-200">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
            <svg className="w-6 h-6 text-primary-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-lg">Book Appointment</h3>
          <p className="text-sm text-foreground-muted mb-4">Select a date above to view available slots and book instantly.</p>
          <Link href={`/book/${today}`} className="inline-block px-4 py-2 bg-primary hover:bg-primary-hover text-primary-fg text-sm font-medium rounded-full transition-colors">
            Book for today →
          </Link>
        </div>

        {user && (
          <Link href="/my-appointments" className="block rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <svg className="w-6 h-6 text-primary-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-lg">My Appointments</h3>
            <p className="text-sm text-foreground-muted">View, manage, or cancel your upcoming appointments.</p>
          </Link>
        )}

        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 hover:-translate-y-1 transition-transform duration-200">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
            <svg className="w-6 h-6 text-primary-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-lg">Clinic Info</h3>
          <p className="text-sm text-foreground-muted">
            Open Mon – Fri, 08:00 – 17:00. 30-minute appointments. Walk-ins may have limited availability.
          </p>
        </div>
      </div>

      {/* Map & Location */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Our Location</h2>
        <div className="rounded-[28px] overflow-hidden border border-glass-border shadow-lg bg-surface flex flex-col md:flex-row">
          <div className="md:w-1/3 p-8 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <svg className="w-6 h-6 text-primary-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Pusat Kesihatan Universiti (PKU)</h3>
            <p className="text-foreground-muted mb-6">
              Kampus Parit Raja, Universiti Tun Hussein Onn Malaysia,<br/>
              86400 Parit Raja, Batu Pahat,<br/>
              Johor, Malaysia
            </p>
            <a 
              href="https://maps.google.com/?q=Pusat+Kesihatan+Universiti+UTHM" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-background border border-primary text-primary hover:bg-primary hover:text-primary-fg rounded-full font-medium transition-colors"
            >
              Get Directions
            </a>
          </div>
          <div className="md:w-2/3 min-h-[300px] bg-glass">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15951.171801826048!2d103.07849615!3d1.86018784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d05bce272ad691%3A0xc3c509741e21b7c1!2sPusat%20Kesihatan%20Universiti%20UTHM!5e0!3m2!1sen!2smy!4v1714123456789!5m2!1sen!2smy" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '300px' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="PKU UTHM Location Map"
            />
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      {!user && (
        <div className="mt-10 rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Demo Accounts
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-surface rounded-[16px] p-4 border border-glass-border shadow-sm">
              <p className="font-bold text-foreground mb-1">Admin</p>
              <p className="text-foreground-muted">admin@pku.uthm.edu.my</p>
              <p className="text-foreground-muted mt-1 font-mono text-xs">admin123</p>
            </div>
            <div className="bg-surface rounded-[16px] p-4 border border-glass-border shadow-sm">
              <p className="font-bold text-foreground mb-1">Staff</p>
              <p className="text-foreground-muted">staff@pku.uthm.edu.my</p>
              <p className="text-foreground-muted mt-1 font-mono text-xs">staff123</p>
            </div>
            <div className="bg-surface rounded-[16px] p-4 border border-glass-border shadow-sm">
              <p className="font-bold text-foreground mb-1">Patient</p>
              <p className="text-foreground-muted">ahmad@student.uthm.edu.my</p>
              <p className="text-foreground-muted mt-1 font-mono text-xs">patient123</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
