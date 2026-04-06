// Database types matching Supabase schema

export type UserRole = 'user' | 'patient' | 'staff' | 'admin';
export type AffiliationType = 'student' | 'uthm_staff';

export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  matric_number: string | null;
  faculty: string | null;
  affiliation_type: AffiliationType | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: string;
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  slot_minutes: number;
  active: boolean;
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  block_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  reason: string | null;
  created_by: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  cancelled_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient?: Profile;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined
  actor?: Profile;
}

// Derived / UI types
export interface TimeSlot {
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: 'available' | 'booked' | 'blocked' | 'past';
  appointment?: Appointment;
  block?: BlockedSlot;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
  totalSlots: number;
  bookedCount: number;
  blockedCount: number;
  availableCount: number;
  occupancyLevel: 'available' | 'limited' | 'full';
}

export interface WeekAvailability {
  weekStart: string;
  weekEnd: string;
  days: DayAvailability[];
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

// API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
