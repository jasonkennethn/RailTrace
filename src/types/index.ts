// User roles and permissions
export type UserRole = 'admin' | 'drm' | 'sr_den' | 'den' | 'inspector' | 'manufacturer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  division?: string;
  section?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Product and inspection types
export interface Product {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  qrCode: string;
  blockchainHash: string;
  manufacturedDate: Date;
  status: 'manufactured' | 'dispatched' | 'installed' | 'inspected' | 'maintenance';
  location?: string;
}

export interface Inspection {
  id: string;
  productId: string;
  inspectorId: string;
  inspectorName: string;
  date: Date;
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  images: string[];
  blockchainHash: string;
  location: string;
}

// Vendor and AI scoring
export interface Vendor {
  id: string;
  name: string;
  email: string;
  products: string[];
  aiScore: number;
  defectRate: number;
  deliveryScore: number;
  lastUpdated: Date;
}

// Navigation and dashboard types
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}