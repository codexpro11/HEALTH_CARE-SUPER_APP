import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './Button';

export interface FilterPanelProps {
  title?: string;
  isOpen?: boolean;
  onReset?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title = 'Filter Results',
  onReset,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>{title}</span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};
