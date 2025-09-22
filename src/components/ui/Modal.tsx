import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'bottom-sheet' | 'center' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const modalSizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
};

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  subtitle,
  size = 'md',
  variant = 'center',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (variant === 'bottom-sheet') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="fixed inset-0 bg-black/40 transition-opacity"
          onClick={handleOverlayClick}
        />
        <div className="relative bg-card-light dark:bg-card-dark rounded-t-xl w-full max-h-[85vh] sm:max-h-[90vh] transform transition-transform">
          {/* Handle bar */}
          <div className="flex h-8 sm:h-12 w-full flex-col items-center justify-center p-2">
            <div className="h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-border-light dark:bg-border-dark"></div>
          </div>
          
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="w-6 sm:w-8"></div>
              <div className="text-center flex-1 min-w-0">
                {title && (
                  <h1 className="text-base sm:text-lg font-bold text-content-light dark:text-content-dark font-display truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-16 sm:pb-20">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-card-light dark:bg-card-dark">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4 py-4">
            <div>
              {title && (
                <h1 className="text-xl font-bold text-content-light dark:text-content-dark font-display">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        <div 
          className="fixed inset-0 bg-black/40 transition-opacity"
          onClick={handleOverlayClick}
        />
        <div className={`
          relative bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full
          ${modalSizes[size]}
          transform transition-all
        `}>
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
              <div className="flex-1">
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
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-subtle-light hover:bg-gray-100 dark:text-subtle-dark dark:hover:bg-gray-800 transition-colors flex-shrink-0 ml-4"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className={title ? 'px-6 py-6' : 'p-6'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}