export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor' | 'depot' | 'engineer' | 'inspector';
  approved: boolean;
  createdAt: Date;
  lastLogin?: Date;
  organizationId?: string;
  organizationName?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  phone?: string;
  location?: string;
  department?: string;
  experience?: string;
  qualifications?: string;
  reason?: string;
}

export interface RailwayFitting {
  id: string;
  qrCode: string;
  type: 'clip' | 'pad' | 'liner' | 'sleeper';
  vendorId: string;
  vendorName: string;
  lotNumber: string;
  manufactureDate: Date;
  specifications: {
    material: string;
    dimensions: string;
    grade: string;
    weight: number;
  };
  blockchainHash?: string;
  status: 'manufactured' | 'in_transit' | 'received' | 'installed' | 'inspected';
  createdAt: Date;
}

export interface StockEntry {
  id: string;
  fittingId: string;
  depotId: string;
  receivedDate: Date;
  quantity: number;
  condition: 'good' | 'damaged' | 'rejected';
  inspectorId: string;
  notes?: string;
  blockchainHash?: string;
}

export interface Installation {
  id: string;
  fittingId: string;
  engineerId: string;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  };
  trackSection: string;
  installationDate: Date;
  notes?: string;
  blockchainHash?: string;
}

export interface Inspection {
  id: string;
  fittingId: string;
  inspectorId: string;
  inspectionDate: Date;
  condition: 'ok' | 'worn' | 'defective' | 'critical';
  defectType?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes: string;
  mediaUrls: string[];
  recommendedAction: 'none' | 'monitor' | 'replace' | 'immediate_action';
  nextInspectionDue?: Date;
  blockchainHash?: string;
  aiHealthScore?: number;
}

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  certifications: string[];
  performanceScore?: number;
  totalSupplied: number;
  defectRate: number;
  warrantyClaims: number;
  isActive: boolean;
}

export interface Depot {
  id: string;
  name: string;
  location: string;
  managerId: string;
  capacity: number;
  currentStock: number;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface BlockchainRecord {
  id: string;
  transactionHash: string;
  fittingId: string;
  eventType: 'manufacture' | 'receive' | 'install' | 'inspect';
  timestamp: Date;
  data: Record<string, unknown>;
  verificationStatus: 'pending' | 'confirmed' | 'failed';
}

export interface AIAnalysis {
  vendorRankings: Array<{
    vendorId: string;
    vendorName: string;
    score: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  defectPredictions: Array<{
    fittingId: string;
    riskScore: number;
    estimatedFailureDate: Date;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    affectedItems: string[];
  }>;
}