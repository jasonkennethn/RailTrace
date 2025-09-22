import { Home, Package, Truck, QrCode, User, Bell } from 'lucide-react';
import { navigationService } from '../../services/navigationService';

export interface VendorFooterNavProps {
  active?: 'home' | 'batches' | 'shipments' | 'qr' | 'alerts' | 'profile';
  onNavigate?: (route: 'home' | 'batches' | 'shipments' | 'qr' | 'alerts' | 'profile') => void;
}

const mapToAppTab = (route: VendorFooterNavProps['active']): string => {
  switch (route) {
    case 'home': return 'dashboard';
    case 'batches': return 'inventory';
    case 'shipments': return 'shipments';
    case 'qr': return 'qr-generate';
    case 'alerts': return 'reports'; // wired to Notifications in App.tsx for vendor
    case 'profile': return 'settings';
    default: return 'dashboard';
  }
};

export default function VendorFooterNav({ active = 'home', onNavigate }: VendorFooterNavProps) {
  const handleNav = (key: VendorFooterNavProps['active']) => {
    if (onNavigate) {
      onNavigate(key);
    } else {
      // Bridge footer to App's tab switch
      const tab = mapToAppTab(key);
      navigationService.navigate(tab, { smooth: true });
      // Also broadcast a custom event for App to pick up (optional fallback if needed)
      try { window.dispatchEvent(new CustomEvent('vendor-tab-change', { detail: { tab } })); } catch {}
    }
  };

  const Item = ({ keyName, label, Icon }: { keyName: VendorFooterNavProps['active']; label: string; Icon: any }) => {
    const isActive = active === keyName;
    return (
      <button
        className="flex flex-1 flex-col items-center justify-center gap-1 touch-target"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => handleNav(keyName)}
        style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
      >
        <Icon className="h-5 w-5" />
        <span className={isActive ? 'text-xs font-bold' : 'text-xs font-medium'}>{label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in oklab, var(--color-card) 90%, transparent)', borderColor: 'var(--color-border)' }}>
      <div className="flex h-16 justify-around">
        <Item keyName="home" label="Home" Icon={Home} />
        <Item keyName="batches" label="Batches" Icon={Package} />
        <Item keyName="shipments" label="Shipments" Icon={Truck} />
        <Item keyName="qr" label="QR Activity" Icon={QrCode} />
        <Item keyName="alerts" label="Alerts" Icon={Bell} />
        <Item keyName="profile" label="Profile" Icon={User} />
      </div>
    </nav>
  );
}
