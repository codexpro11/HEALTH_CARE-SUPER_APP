import { downloadText } from '../../lib/downloadText';
import { TelehealthLink } from '../../components/appointments/TelehealthLink';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  FileText,
  UserCheck,
  ArrowLeft,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentApi.getAppointmentById(id || ''),
    enabled: !!id,
  });

  const appointment = response?.data;

  if (isLoading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  if (isError || !appointment) {
    return (
      <ErrorState
        title="Appointment Not Found"
        message="Could not find the requested consultation records."
        onRetry={() => navigate('/app/appointments')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/app/appointments')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Consultations</span>
      </button>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <img
              src={appointment.doctorPhotoUrl}
              alt={appointment.doctorName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
            />
            <div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded transition-colors">
                {appointment.doctorSpecialization}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 transition-colors">
                {appointment.doctorName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{appointment.hospitalName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Schedule & Telehealth Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-300 transition-colors">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Date</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{appointment.appointmentDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Time</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{appointment.appointmentTime}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Format</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {appointment.consultationType === 'VIDEO' ? 'Telehealth Video Call' : 'In-Person Consultation'}
            </span>
          </div>
        </div>

        {/* Reason for Visit */}
        {appointment.reasonForVisit && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors">
              Reason for Visit / Chief Complaint
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 transition-colors">
              {appointment.reasonForVisit}
            </p>
          </div>
        )}

        {/* Video Call Entry Room if Video */}
        {appointment.consultationType === 'VIDEO' && appointment.meetingLink && (
          <div className="p-4 bg-teal-50/70 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 transition-colors">Video consultation</p>
                <p className="text-xs text-teal-800 dark:text-teal-400 transition-colors">
                  Preview only; no video room has been created.
                </p>
              </div>
            </div>
            <TelehealthLink href={appointment.meetingLink} />
          </div>
        )}

        {/* Payment and Billing receipt */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span>Consultation fee: ${appointment.consultationFee} · Payment not verified</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => downloadText('appointment-'+appointment.id+'.txt', 'APPOINTMENT SUMMARY - NOT A PAYMENT RECEIPT\n'+JSON.stringify(appointment, null, 2))}
          >
            Download visit summary
          </Button>
        </div>
      </Card>
    </div>
  );
};
