'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { mockGetDayAvailability } from '@/lib/mock-data';
import { 
  getWeekDates, getWeekRange, formatDateShort, formatDayName, formatTime12h, 
  todayDateStr, addWeeks, isPastDate, isWeekend, getMonthDatesFormatted, 
  formatMonthYear, addMonthsStr 
} from '@/lib/utils/date';
import type { DayAvailability, TimeSlot } from '@/types/database';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ClipboardList, 
  Info, 
  MapPin, 
  Key,
  ArrowRight
} from 'lucide-react';

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
      }`}
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
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekDays, setWeekDays] = useState<DayAvailability[]>([]);
  const [monthDays, setMonthDays] = useState<(DayAvailability & { isCurrentMonth: boolean, isToday: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const refDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const weekDates = getWeekDates(refDate);
  const weekRange = getWeekRange(refDate);

  const loadSchedule = useCallback(() => {
    setLoading(true);
    
    if (viewMode === 'week') {
      const baseDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
      const datesToLoad = getWeekDates(baseDate);
      const days = datesToLoad.map((d) => mockGetDayAvailability(d));
      setWeekDays(days);
    } else {
      const baseMonthDate = monthOffset === 0 ? today : addMonthsStr(today, monthOffset);
      const gridDates = getMonthDatesFormatted(baseMonthDate);
      const days = gridDates.map(gd => ({
        ...mockGetDayAvailability(gd.date),
        isCurrentMonth: gd.isCurrentMonth,
        isToday: gd.isToday,
      }));
      setMonthDays(days);
    }
    
    setLoading(false);
  }, [weekOffset, monthOffset, viewMode, today]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

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

      {/* Navigator & Modes */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6 w-full max-w-2xl mx-auto px-4">
        {viewMode === 'week' ? (
          <>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-glass border border-glass-border shadow-sm hover:bg-glass-strong hover:shadow-md transition-all text-primary"
                aria-label="Previous Week"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              
              <div className="text-center min-w-[140px]">
                <p className="text-base font-bold text-foreground">
                  {weekDays.length > 0
                    ? `${formatDateShort(weekDays.filter(d => !isWeekend(d.date))[0]?.date || weekRange.start)} – ${formatDateShort(weekDays.filter(d => !isWeekend(d.date)).slice(-1)[0]?.date || weekRange.end)}`
                    : `${formatDateShort(weekRange.start)} – ${formatDateShort(weekRange.end)}`}
                </p>
              </div>

              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-glass border border-glass-border shadow-sm hover:bg-glass-strong hover:shadow-md transition-all text-primary"
                aria-label="Next Week"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('month')}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-all"
              >
                Show 1 Month
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs text-primary font-medium hover:underline underline-offset-4 px-2"
                >
                  Go to current
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
              <button
                onClick={() => setMonthOffset((m) => m - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-glass border border-glass-border shadow-sm hover:bg-glass-strong hover:shadow-md transition-all text-primary"
                aria-label="Previous Month"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              
              <div className="text-center min-w-[140px]">
                <p className="text-base font-bold text-foreground">
                  {formatMonthYear(monthOffset === 0 ? today : addMonthsStr(today, monthOffset))}
                </p>
              </div>

              <button
                onClick={() => setMonthOffset((m) => m + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-glass border border-glass-border shadow-sm hover:bg-glass-strong hover:shadow-md transition-all text-primary"
                aria-label="Next Month"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('week')}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-all"
              >
                Show 1 Week
              </button>
              {monthOffset !== 0 && (
                <button
                  onClick={() => setMonthOffset(0)}
                  className="text-xs text-primary font-medium hover:underline underline-offset-4 px-2"
                >
                  Go to current
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="mb-6 flex justify-center">
        <StatusLegend />
      </div>

      {/* Week/Month Grid */}
      {viewMode === 'week' ? (
        loading ? (
          <div className="flex overflow-x-auto gap-4 pb-6 px-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[160px] md:min-w-[180px] shrink-0 snap-start rounded-xl border border-border p-4 animate-pulse h-48 bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-6 px-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {weekDays.filter(day => !isWeekend(day.date)).map((day) => (
              <div key={day.date} className="min-w-[160px] md:min-w-[180px] shrink-0 snap-start">
                <DayCard day={day} isToday={day.date === today} />
              </div>
            ))}
          </div>
        )
      ) : (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4 animate-pulse h-48 bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {monthDays.filter(day => !isWeekend(day.date) && day.isCurrentMonth).map((day) => (
              <DayCard key={day.date} day={day} isToday={day.date === today} />
            ))}
          </div>
        )
      )}

      {/* Quick Actions */}
      {user && (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/my-appointments" className="block rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <ClipboardList size={24} color="white" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-lg">My Appointments</h3>
            <p className="text-sm text-foreground-muted">View, manage, or cancel your upcoming appointments.</p>
          </Link>
        </div>
      )}

      {/* Map & Location */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Our Location</h2>
        <div className="rounded-[28px] overflow-hidden border border-glass-border shadow-lg bg-surface flex flex-col md:flex-row">
          <div className="md:w-1/3 p-8 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <MapPin size={24} color="white" strokeWidth={2} />
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

    </div>
  );
}
