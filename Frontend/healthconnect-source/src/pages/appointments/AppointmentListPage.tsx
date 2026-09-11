import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, RotateCcw, XCircle, AlertCircle, Video } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const AppointmentListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('2026-09-18');
  const [newTime, setNewTime] = useState('02:00 PM');
  const [cancelApt, setCancelApt] = useState<Appointment | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const statusFilter: AppointmentStatus | undefined =
    activeTab === 'UPCOMING' ? 'CONFIRMED' : activeTab === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED';

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', activeTab],
    queryFn: () => appointmentApi.getAppointments(statusFilter),
  });

  const appointments = response?.data || [];

  const rescheduleMutation = useMutation({
    mutationFn: (variables: { id: string; date: string; time: string }) =>
      appointmentApi.rescheduleAppointment(variables.id, {
        slotDate: variables.date,
        slotTime: variables.time,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setRescheduleApt(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCancelApt(null);
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
            Consultations & Visits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Track scheduled visits, join telehealth video calls, and review clinical summaries.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/doctors')}
        >
          Book New Consultation
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'UPCOMING'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Upcoming Visits
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'COMPLETED'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Past & Completed
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'CANCELLED'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : isError ? (
        <ErrorState message="Could not retrieve appointment list." onRetry={() => refetch()} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description={`You do not have any ${activeTab.toLowerCase()} appointments.`}
          actionLabel={activeTab === 'UPCOMING' ? 'Schedule an Appointment' : undefined}
          onAction={() => navigate('/app/doctors')}
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onViewDetails={(a) => navigate(`/app/appointments/${a.id}`)}
              onReschedule={(a) => setRescheduleApt(a)}
              onCancel={(a) => setCancelApt(a)}
            />
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <Modal
          isOpen={!!rescheduleApt}
          onClose={() => setRescheduleApt(null)}
          title={`Reschedule Visit with ${rescheduleApt.doctorName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Current Schedule:</span>
              <p className="text-slate-600 dark:text-slate-400">
                {rescheduleApt.appointmentDate} at {rescheduleApt.appointmentTime}
              </p>
            </div>

            <Input
              label="New Appointment Date"
              type="date"
              value={newDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />

            <Select
              label="New Time Slot"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              options={[
                { value: '09:00 AM', label: '09:00 AM' },
                { value: '11:30 AM', label: '11:30 AM' },
                { value: '02:00 PM', label: '02:00 PM' },
                { value: '04:30 PM', label: '04:30 PM' },
              ]}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <Button variant="outline" onClick={() => setRescheduleApt(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={rescheduleMutation.isPending}
                onClick={() =>
                  rescheduleMutation.mutate({
                    id: rescheduleApt.id,
                    date: newDate,
                    time: newTime,
                  })
                }
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelApt && (
        <Modal
          isOpen={!!cancelApt}
          onClose={() => setCancelApt(null)}
          title="Cancel Appointment"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
              Are you sure you want to cancel your consultation with{' '}
              <strong className="text-slate-900 dark:text-slate-200">{cancelApt.doctorName}</strong> on {cancelApt.appointmentDate}? Any pre-paid fees will be automatically credited back.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <Button variant="outline" onClick={() => setCancelApt(null)}>
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                isLoading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancelApt.id)}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
