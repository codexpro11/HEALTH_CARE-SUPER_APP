import React from 'react';
import { Bell, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AppNotification } from '../../types';
import { safeNotificationRoute } from '../../lib/emergencyRules';

export interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onClick?: (notification: AppNotification) => void;
  busy?: boolean;
}
export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onClick, busy }) => {
  const route = safeNotificationRoute(notification.actionUrl);
  const Icon = notification.type.startsWith('Emergency') ? Siren : Bell;
  return <article className={'p-4 rounded-xl border flex items-start gap-3 ' + (notification.read ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800')}>
    <Icon className="w-5 h-5 shrink-0 text-teal-600 mt-1" />
    <div className="min-w-0 flex-1 space-y-2">
      <h3 className="text-sm font-bold">{notification.title}{!notification.read && <span className="ml-2 text-xs text-teal-700 dark:text-teal-300">Unread</span>}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{notification.message}</p>
      <time className="block text-xs text-slate-500" dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
      <div className="flex flex-wrap gap-4 text-xs">
        {route && <Link className="text-teal-700 dark:text-teal-300 underline" to={route} onClick={() => onClick?.(notification)}>View related item</Link>}
        {!notification.read && onMarkRead && <button className="text-teal-700 dark:text-teal-300 underline disabled:opacity-50" disabled={busy} onClick={() => onMarkRead(notification.id)}>Mark as read</button>}
      </div>
    </div>
  </article>;
};
