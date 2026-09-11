import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'interactive' | 'emergency';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-colors',
    flat: 'bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-2xl transition-colors',
    interactive:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-200 cursor-pointer',
    emergency:
      'bg-gradient-to-br from-rose-50 via-white to-rose-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-sm transition-colors',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
