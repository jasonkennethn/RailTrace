import { NavItem, UserRole } from '../types';

export const navigationItems: NavItem[] = [
  // Dashboard always first for all roles
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'drm', 'den', 'inspector', 'manufacturer'] },
  
  // Administrator navigation
  { label: 'User Management', path: '/users', icon: 'Users', roles: ['admin'] },
  { label: 'Role Management', path: '/roles', icon: 'Shield', roles: ['admin'] },
  { label: 'Reports', path: '/reports', icon: 'FileSpreadsheet', roles: ['admin'] },
  { label: 'Audit Logs & Reports', path: '/audit', icon: 'FileCheck', roles: ['admin'] },
  { label: 'Blockchain Data', path: '/blockchain-data', icon: 'Database', roles: ['admin'] },
  { label: 'AI Reports', path: '/ai-reports', icon: 'Brain', roles: ['admin'] },
  
  // DRM navigation
  { label: 'User Management', path: '/users', icon: 'Users', roles: ['drm'] },
  { label: 'Division Reports', path: '/division-reports', icon: 'BarChart3', roles: ['drm'] },
  { label: 'Schedule & Notifications', path: '/schedule-notifications', icon: 'Calendar', roles: ['drm'] },
  
  // DEN navigation
  { label: 'Section Reports', path: '/section-reports', icon: 'BarChart3', roles: ['den'] },
  { label: 'Inspection Overview', path: '/inspection-overview', icon: 'Eye', roles: ['den'] },
  { label: 'Assign Tasks', path: '/assign-tasks', icon: 'UserPlus', roles: ['den'] },
  { label: 'Inspection Logs', path: '/inspection-logs', icon: 'FileText', roles: ['den'] },
  { label: 'Approval Requests', path: '/approval-requests', icon: 'CheckCircle', roles: ['den'] },
  
  // Field Inspector navigation
  { label: 'Scan Products', path: '/scan', icon: 'QrCode', roles: ['inspector'] },
  { label: 'Record Inspection', path: '/record-inspection', icon: 'Edit', roles: ['inspector'] },
  { label: 'Request Products', path: '/request-products', icon: 'Send', roles: ['inspector'] },
  { label: 'Inspection History', path: '/inspection-history', icon: 'Clock', roles: ['inspector'] },
  
  // Manufacturer navigation
  { label: 'Product Inventory', path: '/inventory', icon: 'Package', roles: ['manufacturer'] },
  { label: 'Order Management', path: '/order-management', icon: 'ShoppingCart', roles: ['manufacturer'] },
  { label: 'Product Details', path: '/product-details', icon: 'Settings', roles: ['manufacturer'] },
  { label: 'Reports', path: '/reports', icon: 'FileSpreadsheet', roles: ['manufacturer'] },
  
  // Settings always last for all roles
  { label: 'Settings', path: '/settings', icon: 'Cog', roles: ['admin', 'drm', 'den', 'inspector', 'manufacturer'] },
];

export const getNavItemsForRole = (userRole: UserRole): NavItem[] => {
  return navigationItems.filter(item => item.roles.includes(userRole));
};