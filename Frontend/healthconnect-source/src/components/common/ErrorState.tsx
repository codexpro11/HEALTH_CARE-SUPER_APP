import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading healthcare data. Please verify connectivity or try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 sm:p-8 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex flex-col items-center text-center transition-colors ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 transition-colors">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 dark:text-rose-100 transition-colors">{title}</h3>
      <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mt-1 mb-4 transition-colors">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
