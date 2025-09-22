import React from 'react';
import { Bell, Search, LogOut, Wifi, WifiOff, Menu, Notifications, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onLogout, onMenuToggle, isSidebarOpen = false }: HeaderProps) {
  const { userData } = useAuth();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#30363d]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden touch-target"
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Indian Railways Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center p-1">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/8/83/Indian_Railways.svg" 
                alt="Indian Railways"
                className="w-full h-full object-contain filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
              <div className="hidden text-white font-bold text-xs text-center">
                <div>IR</div>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground-light dark:text-foreground-dark font-display">RailTrace</h1>
              <p className="text-xs text-subtle-light dark:text-subtle-dark">Indian Railways</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search (Desktop Only, hide when sidebar open) */}
        <div className={`${isSidebarOpen ? 'hidden' : 'hidden md:flex'} flex-1 max-w-md mx-4`}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-subtle-light dark:text-subtle-dark" />
            <input
              type="text"
              placeholder="Search parts, transactions, or reports..."
              className="w-full pl-10 pr-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center space-x-2">
          {/* Online Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-background-light dark:bg-background-dark">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success-light dark:text-success-dark" />
            ) : (
              <WifiOff className="h-4 w-4 text-danger-light dark:text-danger-dark" />
            )}
            <span className="text-xs font-medium text-subtle-light dark:text-subtle-dark">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-light dark:bg-danger-dark text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                {userData?.name || 'User'}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark capitalize">
                {userData?.role || 'admin'}
              </p>
            </div>
            
            {/* User Avatar */}
            <div className="relative">
              <button className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                <User className="h-5 w-5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 text-subtle-light dark:text-subtle-dark hover:text-danger-light dark:hover:text-danger-dark hover:bg-danger-light/10 dark:hover:bg-danger-dark/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Only show when sidebar is closed */}
      {!isSidebarOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-subtle-light dark:text-subtle-dark" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
    </header>
  );
}