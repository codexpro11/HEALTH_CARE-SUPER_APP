import React from 'react';
import { Calendar, Clock, Video, Building2, ExternalLink, RotateCcw, XCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: (apt: Appointment) => void;
  onReschedule?: (apt: Appointment) => void;
  onCancel?: (apt: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onReschedule,
  onCancel,
}) => {
  const isUpcoming = appointment.status === 'CONFIRMED' || appointment.status === 'BOOKED';

  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <img
            src={appointment.doctorPhotoUrl}
            alt={appointment.doctorName}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
          />
          <div>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">{appointment.doctorSpecialization}</span>
            <h4
              onClick={() => onViewDetails?.(appointment)}
              className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              {appointment.doctorName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.hospitalName}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-colors">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500 shrink-0" />
          <span className="font-semibold">{appointment.appointmentDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500 shrink-0" />
          <span>{appointment.appointmentTime}</span>
        </div>
        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
          {appointment.consultationType === 'VIDEO' ? (
            <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium">
              <Video className="w-3.5 h-3.5" /> Telehealth Video
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5" /> In-Clinic Visit
            </span>
          )}
        </div>
      </div>

      {appointment.reasonForVisit && (
        <p className="text-xs text-slate-600 dark:text-slate-400 italic transition-colors">
          <span className="font-semibold not-italic text-slate-700 dark:text-slate-300">Reason: </span>
          {appointment.reasonForVisit}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(appointment)}
        >
          View Details
        </Button>

        <div className="flex items-center gap-2">
          {appointment.meetingLink && isUpcoming && (
            <a
              href={appointment.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Call</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          )}

          {isUpcoming && onReschedule && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}

          {isUpcoming && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
