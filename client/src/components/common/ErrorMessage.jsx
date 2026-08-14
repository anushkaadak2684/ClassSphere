import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          {message && <p className="text-xs text-rose-700 mt-0.5">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          icon={RefreshCw}
          className="border-rose-300 text-rose-800 hover:bg-rose-100 flex-shrink-0"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
