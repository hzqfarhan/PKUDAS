// In-memory mock data store for development without Supabase
// Drop-in replacement — swap for real Supabase queries when credentials are available

import type {
  Profile,
  Appointment,
  AvailabilityRule,
  BlockedSlot,
  AuditLog,
  AppointmentStatus,
  UserRole,
  TimeSlot,
  DayAvailability,
} from '@/types/database';
import { generateTimeSlots, isSlotInPast, todayDateStr, getWeekday, SLOT_MINUTES } from '@/lib/utils/date';

// Use crypto.randomUUID for ID generation
function genId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// DEMO USERS (passwords are plaintext in mock — real auth uses Supabase)
// ============================================================================
interface MockUser {
  id: string;
  email: string;
  password: string;
  profile: Profile;
}

const DEMO_ADMIN: MockUser = {
  id: 'a0000000-0000-0000-0000-000000000001',
  email: 'admin@pku.uthm.edu.my',
  password: 'admin123',
  profile: {
    id: 'a0000000-0000-0000-0000-000000000001',
    role: 'admin',
    full_name: 'Dr. Siti Aminah',
    email: 'admin@pku.uthm.edu.my',
    matric_number: null,
    faculty: null,
    affiliation_type: 'uthm_staff',
    phone: '+60127001001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

const DEMO_STAFF: MockUser = {
  id: 'a0000000-0000-0000-0000-000000000002',
  email: 'staff@pku.uthm.edu.my',
  password: 'staff123',
  profile: {
    id: 'a0000000-0000-0000-0000-000000000002',
    role: 'staff',
    full_name: 'Nurse Fatimah',
    email: 'staff@pku.uthm.edu.my',
    matric_number: null,
    faculty: null,
    affiliation_type: 'uthm_staff',
    phone: '+60127001002',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

const DEMO_PATIENTS: MockUser[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000010',
    email: 'ahmad@student.uthm.edu.my',
    password: 'patient123',
    profile: {
      id: 'a0000000-0000-0000-0000-000000000010',
      role: 'user',
      full_name: 'Ahmad bin Ibrahim',
      email: 'ahmad@student.uthm.edu.my',
      matric_number: 'AI220156',
      faculty: 'FSKTM',
      affiliation_type: 'student',
      phone: '+60121234567',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
  },
  {
    id: 'a0000000-0000-0000-0000-000000000011',
    email: 'nurul@student.uthm.edu.my',
    password: 'patient123',
    profile: {
      id: 'a0000000-0000-0000-0000-000000000011',
      role: 'user',
      full_name: 'Nurul Aisyah',
      email: 'nurul@student.uthm.edu.my',
      matric_number: 'CB220089',
      faculty: 'FKEE',
      affiliation_type: 'student',
      phone: '+60129876543',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
  },
  {
    id: 'a0000000-0000-0000-0000-000000000012',
    email: 'ali@student.uthm.edu.my',
    password: 'patient123',
    profile: {
      id: 'a0000000-0000-0000-0000-000000000012',
      role: 'user',
      full_name: 'Muhammad Ali',
      email: 'ali@student.uthm.edu.my',
      matric_number: 'DF220234',
      faculty: 'FPTV',
      affiliation_type: 'student',
      phone: '+60125551234',
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
  },
];

// ============================================================================
// DATA STORES
// ============================================================================

let users: MockUser[] = [DEMO_ADMIN, DEMO_STAFF, ...DEMO_PATIENTS];

// Availability rules — weekday clinic hours Mon-Fri
let availabilityRules: AvailabilityRule[] = [1, 2, 3, 4, 5].map((day) => ({
  id: genId(),
  weekday: day,
  start_time: '08:00',
  end_time: '17:00',
  slot_minutes: SLOT_MINUTES,
  active: true,
  created_at: '2024-01-01T00:00:00Z',
}));

// Generate sample appointments for this week
function generateSampleAppointments(): Appointment[] {
  const today = todayDateStr();
  const appointments: Appointment[] = [];
  
  // A few sample booked appointments for today and coming days
  const sampleSlots = [
    { patientIdx: 0, dayOffset: 0, time: '09:00' },
    { patientIdx: 1, dayOffset: 0, time: '10:30' },
    { patientIdx: 2, dayOffset: 1, time: '08:30' },
    { patientIdx: 0, dayOffset: 1, time: '14:00' },
    { patientIdx: 1, dayOffset: 2, time: '11:00' },
  ];

  for (const sample of sampleSlots) {
    const date = new Date(today);
    date.setDate(date.getDate() + sample.dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const [h, m] = sample.time.split(':').map(Number);
    const endH = m + SLOT_MINUTES >= 60 ? h + 1 : h;
    const endM = (m + SLOT_MINUTES) % 60;
    
    appointments.push({
      id: genId(),
      patient_id: DEMO_PATIENTS[sample.patientIdx].id,
      appointment_date: dateStr,
      start_time: sample.time,
      end_time: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      status: sample.dayOffset < 0 ? 'completed' : 'booked',
      notes: null,
      cancelled_reason: null,
      created_by: DEMO_PATIENTS[sample.patientIdx].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      patient: DEMO_PATIENTS[sample.patientIdx].profile,
    });
  }
  
  return appointments;
}

let appointments: Appointment[] = generateSampleAppointments();

// Sample blocked slots
let blockedSlots: BlockedSlot[] = [
  {
    id: genId(),
    block_date: todayDateStr(),
    start_time: '12:00',
    end_time: '13:00',
    reason: 'Lunch break',
    created_by: DEMO_ADMIN.id,
    created_at: new Date().toISOString(),
  },
];

let auditLogs: AuditLog[] = [];

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

let currentUserId: string | null = null;

export function mockLogin(email: string, password: string): { user: MockUser | null; error: string | null } {
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { user: null, error: 'Invalid email or password' };
  currentUserId = user.id;
  return { user, error: null };
}

export function mockSignup(
  email: string,
  password: string,
  fullName: string,
  matricNumber?: string,
  faculty?: string,
  affiliationType?: 'student' | 'uthm_staff',
  phone?: string
): { user: MockUser | null; error: string | null } {
  if (users.find((u) => u.email === email)) {
    return { user: null, error: 'Email already registered' };
  }
  const id = genId();
  const newUser: MockUser = {
    id,
    email,
    password,
    profile: {
      id,
      role: 'user',
      full_name: fullName,
      email,
      matric_number: matricNumber || null,
      faculty: faculty || null,
      affiliation_type: affiliationType || null,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  users.push(newUser);
  currentUserId = id;
  return { user: newUser, error: null };
}

export function mockGetCurrentUser(): MockUser | null {
  if (!currentUserId) return null;
  return users.find((u) => u.id === currentUserId) || null;
}

export function mockLogout(): void {
  currentUserId = null;
}

export function mockSetCurrentUser(userId: string): void {
  currentUserId = userId;
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export function mockGetProfile(userId: string): Profile | null {
  const user = users.find((u) => u.id === userId);
  return user?.profile || null;
}

export function mockUpdateProfile(userId: string, updates: Partial<Profile>): Profile | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.profile = { ...user.profile, ...updates, updated_at: new Date().toISOString() };
  return user.profile;
}

// ============================================================================
// AVAILABILITY OPERATIONS
// ============================================================================

export function mockGetAvailabilityRules(): AvailabilityRule[] {
  return availabilityRules.filter((r) => r.active);
}

export function mockGetDayAvailability(dateStr: string): DayAvailability {
  const weekday = getWeekday(dateStr);
  const rule = availabilityRules.find((r) => r.weekday === weekday && r.active);
  
  if (!rule) {
    return {
      date: dateStr,
      slots: [],
      totalSlots: 0,
      bookedCount: 0,
      blockedCount: 0,
      availableCount: 0,
      occupancyLevel: 'full',
    };
  }

  const timeSlots = generateTimeSlots(rule.start_time, rule.end_time, rule.slot_minutes);
  const dayAppointments = appointments.filter(
    (a) => a.appointment_date === dateStr && a.status !== 'cancelled'
  );
  const dayBlocks = blockedSlots.filter((b) => b.block_date === dateStr);

  const slots: TimeSlot[] = timeSlots.map(({ start, end }) => {
    // Check if blocked
    const block = dayBlocks.find(
      (b) => start >= b.start_time && start < b.end_time
    );
    if (block) {
      return { start_time: start, end_time: end, status: 'blocked' as const, block };
    }

    // Check if booked
    const appointment = dayAppointments.find((a) => a.start_time === start);
    if (appointment) {
      return { start_time: start, end_time: end, status: 'booked' as const, appointment };
    }

    // Check if past
    if (isSlotInPast(dateStr, start)) {
      return { start_time: start, end_time: end, status: 'past' as const };
    }

    return { start_time: start, end_time: end, status: 'available' as const };
  });

  const bookedCount = slots.filter((s) => s.status === 'booked').length;
  const blockedCount = slots.filter((s) => s.status === 'blocked').length;
  const pastCount = slots.filter((s) => s.status === 'past').length;
  const availableCount = slots.filter((s) => s.status === 'available').length;
  const totalSlots = slots.length;

  let occupancyLevel: 'available' | 'limited' | 'full' = 'available';
  if (availableCount === 0) {
    occupancyLevel = 'full';
  } else if (availableCount <= 3) {
    occupancyLevel = 'limited';
  }

  return {
    date: dateStr,
    slots,
    totalSlots,
    bookedCount,
    blockedCount,
    availableCount,
    occupancyLevel,
  };
}

// ============================================================================
// APPOINTMENT OPERATIONS
// ============================================================================

export function mockBookAppointment(
  patientId: string,
  dateStr: string,
  startTime: string,
  endTime: string,
  notes?: string
): { appointment: Appointment | null; error: string | null } {
  // Check for past
  if (isSlotInPast(dateStr, startTime)) {
    return { appointment: null, error: 'Cannot book slots in the past' };
  }

  // Check for conflicts
  const existing = appointments.find(
    (a) =>
      a.appointment_date === dateStr &&
      a.start_time === startTime &&
      a.status !== 'cancelled'
  );
  if (existing) {
    return { appointment: null, error: 'This time slot is already booked' };
  }

  // Check for blocks
  const blocked = blockedSlots.find(
    (b) => b.block_date === dateStr && startTime >= b.start_time && startTime < b.end_time
  );
  if (blocked) {
    return { appointment: null, error: 'This time slot is blocked by admin' };
  }

  // Check patient doesn't have an active future appointment (unless override)
  const existingFuture = appointments.find(
    (a) =>
      a.patient_id === patientId &&
      a.appointment_date >= todayDateStr() &&
      a.status === 'booked'
  );
  if (existingFuture) {
    return { appointment: null, error: 'You already have an active appointment. Please cancel it first to book a new one.' };
  }

  const patient = mockGetProfile(patientId);
  const appt: Appointment = {
    id: genId(),
    patient_id: patientId,
    appointment_date: dateStr,
    start_time: startTime,
    end_time: endTime,
    status: 'booked',
    notes: notes || null,
    cancelled_reason: null,
    created_by: patientId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: patient || undefined,
  };

  appointments.push(appt);
  addAuditLog(patientId, 'book_appointment', 'appointment', appt.id, { dateStr, startTime });
  
  return { appointment: appt, error: null };
}

export function mockCancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
): { success: boolean; error: string | null } {
  const appt = appointments.find((a) => a.id === appointmentId);
  if (!appt) return { success: false, error: 'Appointment not found' };

  const user = mockGetProfile(userId);
  if (!user) return { success: false, error: 'User not found' };

  // Patient can only cancel their own
  if (user.role === 'patient' && appt.patient_id !== userId) {
    return { success: false, error: 'You can only cancel your own appointments' };
  }

  if (appt.status === 'cancelled') {
    return { success: false, error: 'Appointment is already cancelled' };
  }

  appt.status = 'cancelled';
  appt.cancelled_reason = reason || null;
  appt.updated_at = new Date().toISOString();

  addAuditLog(userId, 'cancel_appointment', 'appointment', appt.id, { reason });

  return { success: true, error: null };
}

export function mockUpdateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  userId: string,
  reason?: string
): { success: boolean; error: string | null } {
  const appt = appointments.find((a) => a.id === appointmentId);
  if (!appt) return { success: false, error: 'Appointment not found' };

  const oldStatus = appt.status;
  appt.status = status;
  if (status === 'cancelled') appt.cancelled_reason = reason || null;
  appt.updated_at = new Date().toISOString();

  addAuditLog(userId, 'update_appointment_status', 'appointment', appt.id, {
    from: oldStatus,
    to: status,
    reason,
  });

  return { success: true, error: null };
}

export function mockGetAppointments(filters?: {
  patientId?: string;
  date?: string;
  status?: AppointmentStatus;
}): Appointment[] {
  let result = [...appointments];
  if (filters?.patientId) {
    result = result.filter((a) => a.patient_id === filters.patientId);
  }
  if (filters?.date) {
    result = result.filter((a) => a.appointment_date === filters.date);
  }
  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  // Attach patient profiles
  result = result.map((a) => ({
    ...a,
    patient: users.find((u) => u.id === a.patient_id)?.profile,
  }));
  return result.sort((a, b) => {
    if (a.appointment_date !== b.appointment_date)
      return a.appointment_date.localeCompare(b.appointment_date);
    return a.start_time.localeCompare(b.start_time);
  });
}

export function mockGetAppointmentById(id: string): Appointment | null {
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return null;
  return {
    ...appt,
    patient: users.find((u) => u.id === appt.patient_id)?.profile,
  };
}

// ============================================================================
// BLOCKED SLOTS OPERATIONS
// ============================================================================

export function mockBlockSlot(
  dateStr: string,
  startTime: string,
  endTime: string,
  reason: string | null,
  userId: string
): { block: BlockedSlot | null; error: string | null } {
  const block: BlockedSlot = {
    id: genId(),
    block_date: dateStr,
    start_time: startTime,
    end_time: endTime,
    reason,
    created_by: userId,
    created_at: new Date().toISOString(),
  };

  blockedSlots.push(block);
  addAuditLog(userId, 'block_slot', 'blocked_slot', block.id, { dateStr, startTime, endTime, reason });

  return { block, error: null };
}

export function mockUnblockSlot(blockId: string, userId: string): { success: boolean; error: string | null } {
  const idx = blockedSlots.findIndex((b) => b.id === blockId);
  if (idx === -1) return { success: false, error: 'Block not found' };

  const block = blockedSlots[idx];
  blockedSlots.splice(idx, 1);
  addAuditLog(userId, 'unblock_slot', 'blocked_slot', block.id, { block });

  return { success: true, error: null };
}

export function mockGetBlockedSlots(dateStr?: string): BlockedSlot[] {
  if (dateStr) return blockedSlots.filter((b) => b.block_date === dateStr);
  return [...blockedSlots];
}

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

function addAuditLog(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
): void {
  auditLogs.push({
    id: genId(),
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString(),
    actor: users.find((u) => u.id === actorId)?.profile,
  });
}

export function mockGetAuditLogs(): AuditLog[] {
  return [...auditLogs]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((log) => ({
      ...log,
      actor: users.find((u) => u.id === log.actor_id)?.profile,
    }));
}

// ============================================================================
// REPORTING
// ============================================================================

export function mockGetDayReport(dateStr: string) {
  const dayAppts = appointments.filter((a) => a.appointment_date === dateStr);
  const availability = mockGetDayAvailability(dateStr);
  
  return {
    date: dateStr,
    totalSlots: availability.totalSlots,
    available: availability.availableCount,
    booked: dayAppts.filter((a) => a.status === 'booked' || a.status === 'confirmed').length,
    completed: dayAppts.filter((a) => a.status === 'completed').length,
    cancelled: dayAppts.filter((a) => a.status === 'cancelled').length,
    noShow: dayAppts.filter((a) => a.status === 'no_show').length,
    blocked: availability.blockedCount,
  };
}

export function mockGetAllProfiles(): Profile[] {
  return users.map((u) => u.profile);
}
