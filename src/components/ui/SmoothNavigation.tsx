import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigation } from '../../services/navigationService';

interface SmoothNavigationProps {
  className?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  title?: string;
  onBack?: () => void;
  onHome?: () => void;
}

export function SmoothNavigation({ 
  className = '',
  showBackButton = true,
  showHomeButton = true,
  title,
  onBack,
  onHome
}: SmoothNavigationProps) {
  const { currentRoute, previousRoute, isNavigating, navigate, goBack, canGoBack } = useNavigation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (canGoBack()) {
      goBack();
    } else {
      navigate('dashboard', { smooth: true });
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      navigate('dashboard', { smooth: true });
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showBackButton && (
        <button
          onClick={handleBack}
          disabled={isTransitioning}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 touch-target
            ${isTransitioning 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] hover:text-[#0d1117] dark:hover:text-[#c9d1d9]'
            }
          `}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      )}

      {showHomeButton && (
        <button
          onClick={handleHome}
          disabled={isTransitioning}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 touch-target
            ${isTransitioning 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] hover:text-[#0d1117] dark:hover:text-[#c9d1d9]'
            }
          `}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
      )}

      {title && (
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] truncate">
            {title}
          </h1>
        </div>
      )}

      {/* Navigation breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-[#57606a] dark:text-[#8b949e]">
        <span className="truncate">{previousRoute || 'Dashboard'}</span>
        <span>→</span>
        <span className="font-medium text-[#0d1117] dark:text-[#c9d1d9] truncate">
          {currentRoute}
        </span>
      </div>
    </div>
  );
}

// Smooth page transition wrapper
interface SmoothPageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function SmoothPageTransition({ children, className = '' }: SmoothPageTransitionProps) {
  const { isNavigating } = useNavigation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isNavigating) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  return (
    <div 
      className={`
        transition-all duration-200 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
