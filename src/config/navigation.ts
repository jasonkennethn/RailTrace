import { NavItem, UserRole } from '../types';

export const navigationItems: NavItem[] = [
  // Administrator navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['admin'] },
  { label: 'User Management', path: '/users', icon: 'Users', roles: ['admin', 'drm'] },
  { label: 'Role Management', path: '/roles', icon: 'Shield', roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: 'Cog', roles: ['admin'] },
  { label: 'Reports', path: '/reports', icon: 'FileSpreadsheet', roles: ['admin', 'drm', 'manufacturer'] },
  { label: 'Audit Logs', path: '/audit', icon: 'FileCheck', roles: ['admin'] },
  
  // DRM navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['drm'] },
  { label: 'Division Reports', path: '/division-reports', icon: 'BarChart3', roles: ['drm'] },
  { label: 'Schedule & Notifications', path: '/schedule-notifications', icon: 'Calendar', roles: ['drm'] },
  
  // Sr. DEN navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['sr_den'] },
  { label: 'Sub-Division Reports', path: '/subdivision-reports', icon: 'TrendingUp', roles: ['sr_den'] },
  { label: 'Inspection Overview', path: '/inspection-overview', icon: 'Eye', roles: ['sr_den'] },
  
  // DEN navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['den'] },
  { label: 'Section Reports', path: '/section-reports', icon: 'BarChart3', roles: ['den'] },
  { label: 'Assign Tasks', path: '/assign-tasks', icon: 'UserPlus', roles: ['den'] },
  { label: 'Inspection Logs', path: '/inspection-logs', icon: 'FileText', roles: ['den'] },
  
  // Inspector navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['inspector'] },
  { label: 'Scan Products', path: '/scan', icon: 'QrCode', roles: ['inspector'] },
  { label: 'Record Inspection', path: '/record-inspection', icon: 'Edit', roles: ['inspector'] },
  { label: 'Request Products', path: '/request-products', icon: 'Send', roles: ['inspector'] },
  { label: 'Inspection History', path: '/inspection-history', icon: 'Clock', roles: ['inspector'] },
  
  // Manufacturer navigation
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['manufacturer'] },
  { label: 'Product Inventory', path: '/inventory', icon: 'Package', roles: ['manufacturer'] },
  { label: 'Order Management', path: '/order-management', icon: 'ShoppingCart', roles: ['manufacturer'] },
  { label: 'Product Details', path: '/product-details', icon: 'Settings', roles: ['manufacturer'] },
];

export const getNavItemsForRole = (userRole: UserRole): NavItem[] => {
  return navigationItems.filter(item => item.roles.includes(userRole));
};