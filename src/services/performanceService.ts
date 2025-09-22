import { useState, useEffect, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  memoryUsage: number;
  isOptimized: boolean;
}

class PerformanceService {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    updateCount: 0,
    memoryUsage: 0,
    isOptimized: false
  };

  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];
  private updateInterval: NodeJS.Timeout | null = null;

  // Subscribe to performance metrics
  subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of metrics changes
  private notify() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  // Stop performance monitoring
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Update performance metrics
  private updateMetrics() {
    // Measure memory usage (if available)
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Check if optimizations are active
    this.metrics.isOptimized = this.checkOptimizations();
    
    this.notify();
  }

  // Check if performance optimizations are active
  private checkOptimizations(): boolean {
    // Check for React.memo usage
    const hasReactMemo = document.querySelector('[data-react-memo]');
    
    // Check for lazy loading
    const hasLazyComponents = document.querySelector('[data-lazy-loaded]');
    
    // Check for virtualization
    const hasVirtualizedLists = document.querySelector('[data-virtualized]');
    
    return !!(hasReactMemo || hasLazyComponents || hasVirtualizedLists);
  }

  // Record render time
  recordRenderTime(startTime: number) {
    const endTime = performance.now();
    this.metrics.renderTime = endTime - startTime;
    this.metrics.updateCount++;
    this.notify();
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Create singleton instance
export const performanceService = new PerformanceService();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceService.getMetrics());

  useEffect(() => {
    const unsubscribe = performanceService.subscribe(setMetrics);
    performanceService.startMonitoring();
    
    return () => {
      unsubscribe();
      performanceService.stopMonitoring();
    };
  }, []);

  return metrics;
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for real-time updates
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for high-frequency updates
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Optimize re-renders with React.memo
  withMemo: <P extends object>(
    Component: React.ComponentType<P>,
    areEqual?: (prevProps: P, nextProps: P) => boolean
  ) => {
    const MemoizedComponent = React.memo(Component, areEqual);
    MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
    return MemoizedComponent;
  },

  // Lazy load components
  lazyLoad: <P extends object>(
    importFunc: () => Promise<{ default: React.ComponentType<P> }>
  ) => {
    return React.lazy(importFunc);
  },

  // Virtual scrolling for large lists
  virtualize: <T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
  ) => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      visibleItems: items.slice(visibleStart, visibleEnd),
      startIndex: visibleStart,
      endIndex: visibleEnd,
      totalHeight: items.length * itemHeight,
      offsetY: visibleStart * itemHeight
    };
  }
};

// Real-time update optimization
export function useOptimizedRealTimeUpdates<T>(
  data: T[],
  updateInterval: number = 1000,
  maxUpdates: number = 10
) {
  const [optimizedData, setOptimizedData] = useState<T[]>(data);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounced update function
  const debouncedUpdate = useCallback(
    performanceUtils.debounce((newData: T[]) => {
      setOptimizedData(newData);
      setIsUpdating(false);
    }, 100),
    []
  );

  // Throttled update function for high-frequency data
  const throttledUpdate = useCallback(
    performanceUtils.throttle((newData: T[]) => {
      setOptimizedData(newData);
    }, updateInterval),
    [updateInterval]
  );

  useEffect(() => {
    if (data.length > maxUpdates) {
      // Use throttled updates for large datasets
      throttledUpdate(data);
    } else {
      // Use debounced updates for small datasets
      debouncedUpdate(data);
    }
  }, [data, debouncedUpdate, throttledUpdate, maxUpdates]);

  return {
    data: optimizedData,
    isUpdating,
    updateCount: data.length
  };
}

// Mobile-optimized animations
export function useMobileOptimizedAnimations() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    checkMobile();
    window.addEventListener('resize', checkMobile);
    mediaQuery.addEventListener('change', (e) => setPrefersReducedMotion(e.matches));

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', (e) => setPrefersReducedMotion(e.matches));
    };
  }, []);

  return {
    isMobile,
    prefersReducedMotion,
    animationDuration: isMobile ? 200 : 300,
    animationEasing: isMobile ? 'ease-out' : 'ease-in-out'
  };
}
