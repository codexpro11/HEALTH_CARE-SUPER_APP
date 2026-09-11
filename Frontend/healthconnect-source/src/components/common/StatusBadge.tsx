import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400 dark:bg-slate-500';
  let label = status.replace(/_/g, ' ');

  switch (normalized) {
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'DELIVERED':
    case 'REPORT_READY':
    case 'ADEQUATE':
    case 'ACTIVE':
    case 'VERIFIED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
      dotColor = 'bg-emerald-500 dark:bg-emerald-400';
      break;

    case 'BOOKED':
    case 'PHARMACY_PROCESSING':
    case 'PACKED':
    case 'SAMPLE_COLLECTION':
    case 'PROCESSING':
    case 'IN_PROGRESS':
    case 'OUT_FOR_DELIVERY':
    case 'DISPATCHED':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50';
      dotColor = 'bg-teal-500 dark:bg-teal-400 animate-pulse';
      break;

    case 'LOW':
    case 'PAYMENT_PENDING':
    case 'PENDING':
    case 'RESTRICTED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
      dotColor = 'bg-amber-500 dark:bg-amber-400';
      break;

    case 'CRITICAL':
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
    case 'NO_SHOW':
    case 'UNAVAILABLE':
    case 'CONFIDENTIAL':
    case 'EXPIRED':
    case 'REVOKED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50';
      dotColor = 'bg-rose-500 dark:bg-rose-400';
      break;
  }

  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider transition-colors ${sizeStyles} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 transition-colors`} />
      <span>{label}</span>
    </span>
  );
};
