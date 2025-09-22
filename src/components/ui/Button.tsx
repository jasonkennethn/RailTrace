import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-sm',
  secondary: 'bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark hover:bg-black/5 dark:hover:bg-white/5 focus:ring-gray-500 border border-border-light dark:border-border-dark',
  success: 'bg-success-light dark:bg-success-dark text-white hover:bg-success-light/90 dark:hover:bg-success-dark/90 focus:ring-success-light/50',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500/50',
  error: 'bg-danger-light dark:bg-danger-dark text-white hover:bg-danger-light/90 dark:hover:bg-danger-dark/90 focus:ring-danger-light/50',
  outline: 'border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-black/5 dark:hover:bg-white/5 focus:ring-gray-500 bg-transparent',
  ghost: 'text-content-light dark:text-content-dark hover:bg-black/5 dark:hover:bg-white/5 focus:ring-gray-500 bg-transparent'
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs h-6',
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12',
  xl: 'px-8 py-4 text-lg h-14'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium font-display
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-95 transform
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading...</span>
        </div>
      )}
      {!loading && (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}