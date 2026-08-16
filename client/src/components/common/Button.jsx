import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm hover:shadow-md hover:shadow-brand-500/20 focus:ring-brand-500 border border-transparent dark:bg-brand-600 dark:hover:bg-brand-500 dark:active:bg-brand-700',
  secondary:
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-600 dark:text-slate-100 dark:border-slate-700',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500 border border-transparent dark:bg-rose-600 dark:hover:bg-rose-500',
  outline:
    'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-xs focus:ring-brand-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:text-slate-200 dark:hover:text-white dark:border-slate-700 dark:hover:border-slate-600',
  ghost:
    'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white',
  dark:
    'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white border border-slate-800 focus:ring-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl gap-2.5',
  xl: 'px-6 py-3 text-base font-bold rounded-2xl gap-2.5',
  icon: 'p-2.5 rounded-xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
