'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  mockGetAppointments,
  mockGetDayReport,
  mockGetBlockedSlots,
  mockUpdateAppointmentStatus,
  mockBlockSlot,
  mockUnblockSlot,
  mockGetAuditLogs,
} from '@/lib/mock-data';
import { todayDateStr, formatDateDisplay, formatTime12h } from '@/lib/utils/date';
import type { Appointment, AppointmentStatus, BlockedSlot, AuditLog } from '@/types/database';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  FileDown, 
  ShieldX, 
  Plus, 
  Trash2, 
  Calendar,
  X,
  Clock,
  User,
  History
} from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-info/20 text-info',
  confirmed: 'bg-success/20 text-success',
  completed: 'bg-surface text-foreground-muted border border-glass-border',
  cancelled: 'bg-destructive/20 text-destructive',
  no_show: 'bg-warning/20 text-warning',
};

const statusOptions: AppointmentStatus[] = ['booked', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function AdminBentoDashboard() {
  const { user, isAdmin, isStaff } = useAuth();
  const router = useRouter();

  // State
  const [selectedDate, setSelectedDate] = useState(todayDateStr());
  const [report, setReport] = useState<ReturnType<typeof mockGetDayReport> | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Modals / Dropdowns
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockStart, setBlockStart] = useState('08:00');
  const [blockEnd, setBlockEnd] = useState('09:00');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (!user || (!isAdmin && !isStaff)) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, selectedDate]);

  const loadData = () => {
    setReport(mockGetDayReport(selectedDate));
    setAppointments(mockGetAppointments({ date: selectedDate }));
    setBlocks(mockGetBlockedSlots(selectedDate));
    if (isAdmin) setLogs(mockGetAuditLogs());
  };

  // Actions
  const handleStatusChange = (appId: string, newStatus: AppointmentStatus) => {
    if (!user) return;
    const result = mockUpdateAppointmentStatus(appId, newStatus, user.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Appointment marked as ${newStatus.replace('_', ' ')}`);
      loadData();
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = mockBlockSlot(selectedDate, blockStart, blockEnd, blockReason, user.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Time slot blocked successfully');
      setShowBlockModal(false);
      loadData();
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!user) return;
    const result = mockUnblockSlot(blockId, user.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Block removed');
      loadData();
    }
  };

  const exportCSV = () => {
    if (appointments.length === 0) {
      toast.error('No appointments to export');
      return;
    }
    const headers = ['Date', 'Time', 'Patient Name', 'Matric/Staff ID', 'Status', 'Notes'];
    const rows = appointments.map((a) => [
      a.appointment_date,
      `${a.start_time} - ${a.end_time}`,
      a.patient?.full_name || '',
      a.patient?.matric_number || '',
      a.status,
      a.notes || '',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edent-schedule-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || (!isAdmin && !isStaff)) return null;

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinic Dashboard</h1>
          <p className="text-foreground-muted mt-1">Manage schedules, appointments, and operations seamlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-full border border-glass-border bg-glass backdrop-blur-xl px-4 py-2 font-medium text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <button
            onClick={exportCSV}
            className="px-5 py-2 rounded-full bg-surface border border-glass-border hover:bg-glass text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <FileDown size={16} color="white" strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* BIG MODULE: Summary Stats (Col Span 12, md:8) */}
        <div className="md:col-span-8 rounded-[32px] border border-glass-border bg-glass backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Overview</h2>
            <span className="px-3 py-1 bg-surface rounded-full text-xs font-semibold text-foreground-muted border border-glass-border uppercase tracking-wider">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>
          {report && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              <div className="flex flex-col group">
                <span className="text-4xl font-bold text-foreground group-hover:scale-105 transition-transform origin-left">{report.totalSlots}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Total</span>
              </div>
              <div className="flex flex-col group border-l border-glass-border pl-4">
                <span className="text-4xl font-bold text-success group-hover:scale-105 transition-transform origin-left">{report.available}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Available</span>
              </div>
              <div className="flex flex-col group border-l border-glass-border pl-4">
                <span className="text-4xl font-bold text-info group-hover:scale-105 transition-transform origin-left">{report.booked}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Booked</span>
              </div>
              <div className="flex flex-col group border-l border-glass-border pl-4">
                <span className="text-4xl font-bold text-foreground-muted group-hover:scale-105 transition-transform origin-left">{report.completed}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Completed</span>
              </div>
              <div className="flex flex-col group border-l border-glass-border pl-4">
                <span className="text-4xl font-bold text-destructive group-hover:scale-105 transition-transform origin-left">{report.cancelled}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Cancelled</span>
              </div>
              <div className="flex flex-col group border-l border-glass-border pl-4">
                <span className="text-4xl font-bold text-warning group-hover:scale-105 transition-transform origin-left">{report.noShow}</span>
                <span className="text-xs text-foreground-muted uppercase tracking-wider mt-1">No Show</span>
              </div>
            </div>
          )}
        </div>

        {/* MODULAR: Block Slots (Col Span 12, md:4) */}
        <div className="md:col-span-4 rounded-[32px] border border-glass-border bg-surface p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldX size={96} className="text-destructive" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-lg font-bold text-foreground">Schedule Blocks</h2>
            <button
              onClick={() => setShowBlockModal(true)}
              className="w-8 h-8 rounded-full bg-primary/20 text-white flex items-center justify-center hover:bg-primary transition-colors"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 relative z-10">
            {blocks.length === 0 ? (
              <p className="text-sm text-foreground-muted">No blocks set for this day.</p>
            ) : (
              blocks.map((b) => (
                <div key={b.id} className="bg-background rounded-xl p-3 border border-glass-border flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-semibold">{formatTime12h(b.start_time)} - {formatTime12h(b.end_time)}</p>
                    <p className="text-xs text-foreground-muted truncate max-w-[150px]">{b.reason}</p>
                  </div>
                  <button onClick={() => handleRemoveBlock(b.id)} className="text-destructive p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BIG MODULE: Appointments List (Col Span 12, md: 8 or 12 depending on audit) */}
        <div className={`md:col-span-${isAdmin ? '8' : '12'} rounded-[32px] border border-glass-border bg-glass backdrop-blur-xl p-6 shadow-sm min-h-[400px] flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Appointments</h2>
            <span className="text-sm font-semibold text-foreground-muted">{appointments.length} scheduled</span>
          </div>
          
          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {appointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/50 border border-dashed border-glass-border rounded-2xl">
                <Calendar size={48} color="white" strokeWidth={1.5} className="opacity-20" />
                <p>No appointments found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="bg-surface rounded-[24px] p-5 border border-glass-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform">
                    <div className="flex gap-4 items-start">
                      <div className="w-14 h-14 rounded-2xl bg-glass flex flex-col items-center justify-center shrink-0 border border-glass-border shadow-sm">
                        <span className="text-xs font-bold text-primary">{appt.start_time.split(':')[0]}</span>
                        <span className="text-[10px] text-foreground-muted">{appt.start_time.split(':')[1]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{appt.patient?.full_name || 'Unknown Patient'}</p>
                        <p className="text-sm text-foreground-muted font-mono mt-0.5">{appt.patient?.matric_number || 'No ID'}</p>
                        {appt.notes && <p className="text-xs text-foreground-muted mt-1.5 italic">&quot;{appt.notes}&quot;</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end lg:self-center">
                       <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[appt.status]}`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                      <select
                        className="bg-background border border-glass-border rounded-full text-xs font-semibold px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ').toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODULAR: Audit Logs (Col Span 12, md:4) */}
        {isAdmin && (
          <div className="md:col-span-4 rounded-[32px] border border-glass-border bg-surface p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-foreground mb-4">Recent Activity</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-glass-border" />
              {logs.length === 0 ? (
                <p className="text-sm text-foreground-muted pl-8">No recent activity.</p>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="relative pl-8">
                    <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                    <p className="text-xs text-foreground-muted">{new Date(log.created_at).toLocaleString()}</p>
                    <p className="text-sm text-foreground font-medium mt-0.5">{log.action}</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5 line-clamp-1 truncate">{log.entity_type} • {log.actor?.full_name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-glass-border relative">
            <button onClick={() => setShowBlockModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
              <X size={20} color="white" strokeWidth={2} />
            </button>
            <h3 className="text-xl font-bold text-foreground mb-6">Block Time Slot</h3>
            <form onSubmit={handleAddBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Start Time</label>
                  <input type="time" required value={blockStart} onChange={e => setBlockStart(e.target.value)} className="w-full rounded-xl border border-glass-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">End Time</label>
                  <input type="time" required value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="w-full rounded-xl border border-glass-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Reason <span className="text-foreground-muted font-normal">(optional)</span></label>
                <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} className="w-full rounded-xl border border-glass-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Lunch break" />
              </div>
              <button type="submit" className="w-full mt-4 py-3 bg-primary hover:bg-primary-hover text-primary-fg rounded-full font-bold shadow-sm transition-colors">
                Add Block
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
