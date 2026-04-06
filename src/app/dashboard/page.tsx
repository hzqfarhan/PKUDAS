'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { mockUpdateProfile, mockUpdateAvatar, mockGetAppointments } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDateDisplay, formatTime12h, todayDateStr } from '@/lib/utils/date';
import { compressImage, validateImageFile } from '@/lib/utils/compress-image';
import type { Appointment } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Calendar,
  Camera,
  Pencil,
  X,
  Check,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  IdCard,
  Shield,
  Clock,
  Upload,
  Trash2,
  CalendarCheck,
  CalendarClock,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, refreshSession } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [affiliationType, setAffiliationType] = useState<'student' | 'uthm_staff'>('student');
  const [phone, setPhone] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name);
      setMatricNumber(user.profile.matric_number || '');
      setFaculty(user.profile.faculty || '');
      setAffiliationType((user.profile.affiliation_type as 'student' | 'uthm_staff') || 'student');
      setPhone(user.profile.phone || '');
      setAvatarPreview(user.profile.avatar_url || null);

      const allAppts = mockGetAppointments({ patientId: user.id });
      setTotalAppointments(allAppts.length);
      const upcoming = allAppts.filter(
        (a) => a.appointment_date >= todayDateStr() && a.status !== 'cancelled'
      );
      setUpcomingAppointments(upcoming);
    }
  }, [user]);

  // Profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      user.profile.full_name,
      user.profile.matric_number,
      user.profile.faculty,
      user.profile.affiliation_type,
      user.profile.phone,
      user.profile.avatar_url,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
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
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setIsEditing(false);
    setMatricNumber(user.profile.matric_number || '');
    setFaculty(user.profile.faculty || '');
    setAffiliationType((user.profile.affiliation_type as 'student' | 'uthm_staff') || 'student');
    setPhone(user.profile.phone || '');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await compressImage(file);
      const originalKB = (result.originalSize / 1024).toFixed(0);
      const compressedKB = (result.compressedSize / 1024).toFixed(0);

      mockUpdateAvatar(user.id, result.dataUrl);
      setAvatarPreview(result.dataUrl);
      refreshSession();
      toast.success(`Photo uploaded! (${originalKB}KB → ${compressedKB}KB)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    if (!user) return;
    mockUpdateAvatar(user.id, null);
    setAvatarPreview(null);
    refreshSession();
    toast.success('Profile photo removed');
  };

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const completion = getProfileCompletion();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground-muted mt-1">Manage your profile, photo, and appointments.</p>
      </div>

      {/* Profile Hero Card */}
      <div className="rounded-[28px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-glass-border shadow-lg bg-surface flex items-center justify-center">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <User size={48} color="#FFFFFF" strokeWidth={1.5} className="opacity-40" />
              )}
            </div>
            {/* Overlay buttons */}
            <div className="absolute inset-0 rounded-2xl bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="w-10 h-10 rounded-xl bg-primary/90 text-white flex items-center justify-center hover:bg-primary transition-colors shadow-md"
                title="Upload photo"
              >
                {isUploadingAvatar ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="w-10 h-10 rounded-xl bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive transition-colors shadow-md"
                  title="Remove photo"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{user.profile.full_name}</h2>
            <p className="text-foreground-muted mt-0.5">{user.profile.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                <Shield size={12} />
                {user.profile.role}
              </span>
              {user.profile.affiliation_type && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-glass-border text-foreground-muted">
                  <GraduationCap size={12} />
                  {user.profile.affiliation_type === 'uthm_staff' ? 'UTHM Staff' : 'Student'}
                </span>
              )}
            </div>
            {/* Upload hint */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs text-primary hover:underline flex items-center gap-1 mx-auto sm:mx-0"
            >
              <Upload size={12} />
              {avatarPreview ? 'Change photo' : 'Upload photo'} (max 10MB)
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-[20px] border border-glass-border bg-glass backdrop-blur-xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
            <CalendarCheck size={20} color="#FFFFFF" />
          </div>
          <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
          <p className="text-xs text-foreground-muted uppercase tracking-wider mt-0.5">Upcoming</p>
        </div>
        <div className="rounded-[20px] border border-glass-border bg-glass backdrop-blur-xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
            <CalendarClock size={20} color="#FFFFFF" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAppointments}</p>
          <p className="text-xs text-foreground-muted uppercase tracking-wider mt-0.5">Total</p>
        </div>
        <div className="rounded-[20px] border border-glass-border bg-glass backdrop-blur-xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
            <UserCheck size={20} color="#FFFFFF" />
          </div>
          <p className="text-2xl font-bold text-foreground">{completion}%</p>
          <p className="text-xs text-foreground-muted uppercase tracking-wider mt-0.5">Profile</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <IdCard size={20} color="#FFFFFF" strokeWidth={2} />
              Personal Details
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <p className="font-medium text-foreground py-2 px-3 rounded-lg bg-surface/50 border border-glass-border text-sm">
                  {user.profile.full_name}
                </p>
                <p className="text-[10px] text-foreground-muted mt-1">Name cannot be changed here.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5">
                  Affiliation
                </label>
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
                <label htmlFor="dash-matric" className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5">
                  Matric / Staff ID <span className="text-destructive">*</span>
                </label>
                <input
                  id="dash-matric"
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-glass-border bg-surface/80 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground-muted text-sm"
                  placeholder={affiliationType === 'student' ? 'e.g. AI220156' : 'e.g. 123456'}
                />
              </div>

              <div>
                <label htmlFor="dash-faculty" className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5">
                  Faculty / Dept <span className="text-destructive">*</span>
                </label>
                <input
                  id="dash-faculty"
                  type="text"
                  required
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-glass-border bg-surface/80 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground-muted text-sm"
                  placeholder="e.g. FSKTM"
                />
              </div>

              <div>
                <label htmlFor="dash-phone" className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5">
                  Phone <span className="text-foreground-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="dash-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-glass-border bg-surface/80 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground-muted text-sm"
                  placeholder="e.g. 0123456789"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <DetailRow icon={User} label="Full Name" value={user.profile.full_name} />
              <DetailRow icon={Mail} label="Email" value={user.profile.email} />
              <div className="border-t border-glass-border pt-4" />
              <DetailRow
                icon={GraduationCap}
                label="Affiliation"
                value={user.profile.affiliation_type === 'uthm_staff' ? 'UTHM Staff' : 'Student'}
              />
              <DetailRow icon={IdCard} label="Matric / Staff ID" value={user.profile.matric_number || '—'} />
              <DetailRow icon={Building2} label="Faculty / Dept" value={user.profile.faculty || '—'} />
              <DetailRow icon={Phone} label="Phone" value={user.profile.phone || '—'} />
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm flex-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
              <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
              Upcoming Appointments
            </h2>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4 border border-glass-border">
                  <Clock size={28} color="#FFFFFF" className="opacity-30" />
                </div>
                <p className="text-foreground-muted mb-4">No upcoming appointments.</p>
                <Link
                  href="/"
                  className="px-5 py-2.5 inline-block rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 shadow-sm"
                >
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-xl border border-glass-border bg-surface/60 backdrop-blur-sm hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-primary">{formatDateDisplay(appt.appointment_date)}</p>
                        <p className="text-sm text-foreground mt-1 font-medium flex items-center gap-1.5">
                          <Clock size={14} color="#FFFFFF" className="opacity-50" />
                          {formatTime12h(appt.start_time)} – {formatTime12h(appt.end_time)}
                        </p>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info/20 text-info border border-info/30">
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length > 3 && (
                  <p className="text-xs text-foreground-muted text-center">
                    +{upcomingAppointments.length - 3} more
                  </p>
                )}
                <Link
                  href="/my-appointments"
                  className="text-sm font-medium text-primary hover:underline block mt-4 text-center"
                >
                  View All Appointments →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail row component
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} color="#FFFFFF" className="opacity-60" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
