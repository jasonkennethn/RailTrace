import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  icon?: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  secondary: 'bg-subtle-light/10 text-subtle-light dark:bg-subtle-dark/20 dark:text-subtle-dark',
  success: 'bg-success-light/10 text-success-light dark:bg-success-dark/20 dark:text-success-dark',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  error: 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
};

const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

const dotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5'
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  className = '',
  dot = false,
  icon
}: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium transition-colors
      ${badgeVariants[variant]}
      ${badgeSizes[size]}
      ${className}
    `}>
      {dot && (
        <span className={`
          rounded-full bg-current opacity-60
          ${dotSizes[size]}
        `} />
      )}
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
}