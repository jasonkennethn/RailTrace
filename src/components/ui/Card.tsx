import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

const cardVariants = {
  default: 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark',
  elevated: 'bg-card-light dark:bg-card-dark shadow-lg border-0',
  outlined: 'bg-transparent border-2 border-border-light dark:border-border-dark',
  glass: 'bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm border border-border-light/50 dark:border-border-dark/50'
};

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

const footerAlignVariants = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between'
};

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  variant = 'default',
  padding = 'md'
}: CardProps) {
  return (
    <div className={`
      rounded-lg transition-all duration-200
      ${cardVariants[variant]}
      ${paddingVariants[padding]}
      ${hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  action 
}: CardHeaderProps) {
  return (
    <div className={`border-b border-border-light dark:border-border-dark ${className}`}>
      {(title || subtitle || action) ? (
        <div className="flex items-center justify-between p-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark font-display">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      ) : (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function CardContent({ 
  children, 
  className = '', 
  padding = 'md' 
}: CardContentProps) {
  return (
    <div className={`${paddingVariants[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '', 
  align = 'right' 
}: CardFooterProps) {
  return (
    <div className={`
      border-t border-border-light dark:border-border-dark p-4
      flex items-center ${footerAlignVariants[align]}
      ${className}
    `}>
      {children}
    </div>
  );
}