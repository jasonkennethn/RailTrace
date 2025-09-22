import React, { useState, useRef, useEffect } from 'react';

interface MobileCardCarouselProps {
  children: React.ReactNode[];
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
}

export function MobileCardCarousel({ 
  children, 
  className = '',
  showIndicators = true,
  showNavigation = true
}: MobileCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diff = startX - currentX;
    const threshold = 50;
    
    if (diff > threshold && currentIndex < children.length - 1) {
      // Swipe left - next card
      setCurrentIndex(prev => prev + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      // Swipe right - previous card
      setCurrentIndex(prev => prev - 1);
    }
    
    setCurrentX(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Desktop Grid View */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {children}
      </div>

      {/* Mobile Carousel View */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Navigation Arrows - Removed to prevent blocking data */}

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ width: `${children.length * 100}%` }}
          >
            {children.map((child, index) => (
              <div key={index} className="w-full flex-shrink-0 p-2">
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        {showIndicators && children.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-colors touch-target ${
                  currentIndex === index 
                    ? 'bg-[#1773cf]' 
                    : 'bg-[#d0d7de] dark:bg-[#30363d] hover:bg-[#1773cf]/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
