import React from 'react';

export interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'doctor' | 'stats';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'doctor') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3 w-3/4">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
};
