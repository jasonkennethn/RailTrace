import { 
  LayoutDashboard, 
  QrCode, 
  Package, 
  Wrench, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  Settings,
  Shield,
  TrendingUp,
  X,
  ChevronRight,
  Home,
  Truck,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

// Original Stitch AI format - compact and clean design
const roleMenuItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { id: 'users', label: 'Users', icon: Users, description: 'Manage Users' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'AI Insights' },
    { id: 'blockchain', label: 'Blockchain', icon: Shield, description: 'Audit Trail' },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Generate Reports' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration' }
  ],
  vendor: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Parts & Batches' },
    { id: 'qr-generate', label: 'QR Generate', icon: QrCode, description: 'Create Codes' },
    { id: 'shipments', label: 'Shipments', icon: Truck, description: 'Track Delivery' },
    { id: 'performance', label: 'Performance', icon: BarChart3, description: 'Analytics' }
  ],
  depot: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Depot Overview' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage Stock' },
    { id: 'qr-scan', label: 'QR Scan', icon: QrCode, description: 'Scan Parts' },
    { id: 'transfers', label: 'Transfers', icon: Truck, description: 'Part Transfers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Depot Reports' }
  ],
  engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Installation' },
    { id: 'installations', label: 'Installations', icon: Wrench, description: 'Install & Maintain' },
    { id: 'qr-scan', label: 'QR Scan', icon: QrCode, description: 'Scan Parts' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Repair & Service' },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Work Reports' }
  ],
  inspector: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Inspection' },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck, description: 'Quality Checks' },
    { id: 'qr-scan', label: 'QR Scan', icon: QrCode, description: 'Scan & Inspect' },
    { id: 'quality', label: 'Quality', icon: Shield, description: 'Quality Control' },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Inspection Reports' }
  ]
};

export function Sidebar({ activeTab, onTabChange, isOpen = true, onClose }: SidebarProps) {
  const { userData } = useAuth();
  const { t, language } = useLanguage();

  const userRole = userData?.role || 'admin';
  
  const getRoleMenuItems = () => ({
    admin: [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, description: t('dashboard.overview') },
      { id: 'users', label: t('navigation.users'), icon: Users, description: t('users.title') },
      { id: 'analytics', label: t('navigation.analytics'), icon: TrendingUp, description: t('analytics.insights') },
      { id: 'blockchain', label: t('navigation.blockchain'), icon: Shield, description: t('blockchain.audit') },
      { id: 'reports', label: t('navigation.reports'), icon: BarChart3, description: t('reports.title') },
      { id: 'settings', label: t('navigation.settings'), icon: Settings, description: t('settings.title') }
    ],
    vendor: [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, description: t('dashboard.overview') },
      { id: 'inventory', label: 'My Inventory', icon: Package, description: 'Manage Parts & Batches' },
      { id: 'qr-generate', label: t('navigation.qrGenerate'), icon: QrCode, description: 'Create QR Codes' },
      { id: 'shipments', label: 'Shipments', icon: Truck, description: 'Track Deliveries' },
      { id: 'performance', label: 'Performance', icon: BarChart3, description: t('analytics.performance') }
    ],
    depot: [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, description: 'Depot Overview' },
      { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage Stock' },
      { id: 'qr-scan', label: t('navigation.qrScan'), icon: QrCode, description: 'Scan & Verify Parts' },
      { id: 'transfers', label: 'Transfers', icon: Truck, description: 'Part Transfers' },
      { id: 'reports', label: t('navigation.reports'), icon: BarChart3, description: 'Depot Reports' }
    ],
    engineer: [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, description: 'Installation Overview' },
      { id: 'installations', label: 'Installations', icon: Wrench, description: 'Install & Maintain' },
      { id: 'qr-scan', label: t('navigation.qrScan'), icon: QrCode, description: 'Scan Parts' },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Repair & Service' },
      { id: 'reports', label: t('navigation.reports'), icon: BarChart3, description: 'Work Reports' }
    ],
    inspector: [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, description: 'Inspection Overview' },
      { id: 'inspections', label: 'Inspections', icon: ClipboardCheck, description: 'Quality Checks' },
      { id: 'qr-scan', label: t('navigation.qrScan'), icon: QrCode, description: 'Scan & Inspect' },
      { id: 'quality', label: 'Quality Control', icon: Shield, description: 'Quality Management' },
      { id: 'reports', label: t('navigation.reports'), icon: BarChart3, description: 'Inspection Reports' }
    ]
  });

  // Use original Stitch AI format for English, translated format for other languages
  const menuItems = language === 'en' 
    ? roleMenuItems[userRole as keyof typeof roleMenuItems] || roleMenuItems.admin
    : getRoleMenuItems()[userRole as keyof ReturnType<typeof getRoleMenuItems>] || getRoleMenuItems().admin;

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:block
        shadow-lg lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${language === 'en' ? 'border-[#d0d7de] dark:border-[#30363d]' : 'border-border-light dark:border-border-dark'}`}>
          <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${language === 'en' ? 'bg-[#1773cf]' : 'bg-primary'}`}>
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold font-display ${language === 'en' ? 'text-[#0d1117] dark:text-[#c9d1d9]' : 'text-foreground-light dark:text-foreground-dark'}`}>
                  RailTrace
                </h2>
                <p className={`text-xs capitalize ${language === 'en' ? 'text-[#57606a] dark:text-[#8b949e]' : 'text-subtle-light dark:text-subtle-dark'}`}>
                  {userRole} Portal
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg lg:hidden touch-target ${language === 'en' ? 'text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
        </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
                const isActive = activeTab === item.id;

                // Stitch AI format for English - more compact and clean
                if (language === 'en') {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => handleItemClick(item.id)}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 touch-target
                          ${isActive 
                            ? 'bg-[#1773cf] text-white shadow-lg' 
                            : 'text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d]'
                          }
                        `}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#57606a] dark:text-[#8b949e]'}`} />
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-[#0d1117] dark:text-[#c9d1d9]'}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs ${isActive ? 'text-white/80' : 'text-[#57606a] dark:text-[#8b949e]'}`}>
                            {item.description}
                          </p>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-white" />}
                      </button>
                    </div>
                  );
                }

                // Translated format for other languages - more detailed
            return (
                  <div key={item.id}>
              <button
                      onClick={() => handleItemClick(item.id)}
                className={`
                        w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 touch-target
                        ${isActive 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/5'
                        }
                      `}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-subtle-light dark:text-subtle-dark'}`} />
                        <div>
                          <p className={`font-medium ${isActive ? 'text-white' : 'text-foreground-light dark:text-foreground-dark'}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs ${isActive ? 'text-white/80' : 'text-subtle-light dark:text-subtle-dark'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'text-white' : 'text-subtle-light dark:text-subtle-dark'}`} />
              </button>
                  </div>
            );
          })}
            </div>
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t ${language === 'en' ? 'border-[#d0d7de] dark:border-[#30363d]' : 'border-gray-200 dark:border-[#30363d]'}`}>
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${language === 'en' ? 'bg-[#f6f8fa] dark:bg-[#0d1117]' : 'bg-gray-50 dark:bg-[#0d1117]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${language === 'en' ? 'bg-[#1773cf]/10' : 'bg-primary/10'}`}>
                <Activity className={`h-4 w-4 ${language === 'en' ? 'text-[#1773cf]' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${language === 'en' ? 'text-[#0d1117] dark:text-[#c9d1d9]' : 'text-gray-900 dark:text-gray-100'}`}>
                  System Status
                </p>
                <p className={`text-xs ${language === 'en' ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'}`}>
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}