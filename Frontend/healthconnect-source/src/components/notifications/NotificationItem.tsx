import React from 'react';
import {
  Calendar,
  Pill,
  FileText,
  Truck,
  Siren,
  CreditCard,
  Check,
  Circle,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../../types';

export interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onClick?: (notification: AppNotification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onClick,
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'AppointmentBooked':
      case 'AppointmentCancelled':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'PrescriptionCreated':
        return <Pill className="w-4 h-4 text-indigo-600" />;
      case 'LabReportReady':
        return <FileText className="w-4 h-4 text-cyan-600" />;
      case 'MedicineOrderShipped':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'EmergencyRequestCreated':
        return <Siren className="w-4 h-4 text-rose-600" />;
      case 'PaymentSuccessful':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
        notification.read
          ? 'bg-white border-slate-200/80 hover:bg-slate-50/70'
          : 'bg-teal-50/40 border-teal-200/70 hover:bg-teal-50/60 shadow-xs'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-sm ${
              notification.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'
            }`}
          >
            {notification.title}
          </h4>
          <span className="text-[11px] text-slate-400 shrink-0">
            {new Date(notification.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>
      </div>

      {!notification.read && onMarkRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="p-1 rounded-md text-teal-600 hover:bg-teal-100/50 shrink-0"
          title="Mark as read"
        >
          <Circle className="w-2.5 h-2.5 fill-teal-600" />
        </button>
      )}
    </div>
  );
};
