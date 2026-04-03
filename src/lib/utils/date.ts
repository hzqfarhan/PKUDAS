import { format, parse, addDays, startOfWeek, endOfWeek, isBefore, isAfter, isEqual, parseISO, addMinutes } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Kuala_Lumpur';
export const SLOT_MINUTES = 30;
export const DAILY_START = '08:00';
export const DAILY_END = '17:00';
export const SLOTS_PER_DAY = 18;

export function nowInMYT(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function todayDateStr(): string {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

export function formatDateDisplay(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE, d MMM yyyy');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'd MMM');
}

export function formatDayName(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE');
}

export function formatTime12h(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getWeekDates(referenceDate?: string): string[] {
  const ref = referenceDate ? parseISO(referenceDate) : nowInMYT();
  const weekStart = startOfWeek(ref, { weekStartsOn: 1 }); // Monday start
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(weekStart, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function getWeekRange(referenceDate?: string): { start: string; end: string } {
  const ref = referenceDate ? parseISO(referenceDate) : nowInMYT();
  const weekStart = startOfWeek(ref, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(ref, { weekStartsOn: 1 });
  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  };
}

export function generateTimeSlots(
  startTime: string = DAILY_START,
  endTime: string = DAILY_END,
  slotMinutes: number = SLOT_MINUTES
): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  const baseDate = new Date(2000, 0, 1); // arbitrary base date
  let current = parse(startTime, 'HH:mm', baseDate);
  const end = parse(endTime, 'HH:mm', baseDate);

  while (isBefore(current, end)) {
    const slotEnd = addMinutes(current, slotMinutes);
    if (isAfter(slotEnd, end)) break;
    slots.push({
      start: format(current, 'HH:mm'),
      end: format(slotEnd, 'HH:mm'),
    });
    current = slotEnd;
  }
  return slots;
}

export function isSlotInPast(dateStr: string, startTime: string): boolean {
  const now = nowInMYT();
  const slotDateTime = parse(
    `${dateStr} ${startTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );
  return isBefore(slotDateTime, now);
}

export function isPastDate(dateStr: string): boolean {
  const today = todayDateStr();
  return dateStr < today;
}

export function getWeekday(dateStr: string): number {
  return parseISO(dateStr).getDay();
}

export function addWeeks(dateStr: string, weeks: number): string {
  const date = parseISO(dateStr);
  return format(addDays(date, weeks * 7), 'yyyy-MM-dd');
}

export function isWeekend(dateStr: string): boolean {
  const day = getWeekday(dateStr);
  return day === 0 || day === 6;
}
