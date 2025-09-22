import { useState, useEffect } from 'react';

interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  history: string[];
  isNavigating: boolean;
}

class NavigationService {
  private state: NavigationState = {
    currentRoute: 'dashboard',
    previousRoute: null,
    history: ['dashboard'],
    isNavigating: false
  };

  private listeners: Array<(state: NavigationState) => void> = [];

  // Subscribe to navigation changes
  subscribe(listener: (state: NavigationState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Navigate to a new route with smooth transition
  navigate(route: string, options: { replace?: boolean; smooth?: boolean } = {}) {
    if (this.state.isNavigating) return;
    
    this.state.isNavigating = true;
    this.notify();

    // Add smooth transition delay
    const transitionDelay = options.smooth ? 150 : 0;
    
    setTimeout(() => {
      this.state.previousRoute = this.state.currentRoute;
      this.state.currentRoute = route;
      
      if (!options.replace) {
        this.state.history.push(route);
      } else {
        this.state.history[this.state.history.length - 1] = route;
      }
      
      this.state.isNavigating = false;
      this.notify();
    }, transitionDelay);
  }

  // Go back to previous route
  goBack() {
    if (this.state.history.length > 1) {
      const previousRoute = this.state.history[this.state.history.length - 2];
      this.state.history.pop();
      this.navigate(previousRoute, { replace: true, smooth: true });
    }
  }

  // Get current navigation state
  getState(): NavigationState {
    return { ...this.state };
  }

  // Check if we can go back
  canGoBack(): boolean {
    return this.state.history.length > 1;
  }

  // Reset navigation state
  reset() {
    this.state = {
      currentRoute: 'dashboard',
      previousRoute: null,
      history: ['dashboard'],
      isNavigating: false
    };
    this.notify();
  }
}

// Create singleton instance
export const navigationService = new NavigationService();

// React hook for navigation
export function useNavigation() {
  const [state, setState] = useState<NavigationState>(navigationService.getState());

  useEffect(() => {
    const unsubscribe = navigationService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    navigate: (route: string, options?: { replace?: boolean; smooth?: boolean }) => 
      navigationService.navigate(route, options),
    goBack: () => navigationService.goBack(),
    canGoBack: () => navigationService.canGoBack(),
    reset: () => navigationService.reset()
  };
}

// Navigation utilities
export const navigationUtils = {
  // Get route display name
  getRouteDisplayName: (route: string): string => {
    const routeNames: Record<string, string> = {
      'dashboard': 'Dashboard',
      'users': 'User Management',
      'analytics': 'Analytics',
      'blockchain': 'Blockchain Audit',
      'reports': 'Reports',
      'settings': 'Settings',
      'inventory': 'Inventory',
      'qr-generate': 'QR Generator',
      'qr-scan': 'QR Scanner',
      'shipments': 'Shipments',
      'transfers': 'Transfers',
      'performance': 'Performance'
    };
    return routeNames[route] || route;
  },

  // Check if route requires authentication
  requiresAuth: (route: string): boolean => {
    const protectedRoutes = ['users', 'analytics', 'blockchain', 'reports', 'settings'];
    return protectedRoutes.includes(route);
  },

  // Get route icon
  getRouteIcon: (route: string): string => {
    const routeIcons: Record<string, string> = {
      'dashboard': 'LayoutDashboard',
      'users': 'Users',
      'analytics': 'TrendingUp',
      'blockchain': 'Shield',
      'reports': 'BarChart3',
      'settings': 'Settings',
      'inventory': 'Package',
      'qr-generate': 'QrCode',
      'qr-scan': 'QrCode',
      'shipments': 'Truck',
      'transfers': 'Truck',
      'performance': 'BarChart3'
    };
    return routeIcons[route] || 'LayoutDashboard';
  }
};
