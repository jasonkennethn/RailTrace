import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Product, Inspection, UserRole } from '../types';

// Additional interfaces for comprehensive data management
interface ApprovalRequest {
  id: string;
  type: 'product' | 'budget' | 'maintenance' | 'project';
  title: string;
  requestedBy: string;
  requestedByRole: string;
  amount?: number;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  documents?: string[];
  category?: string;
  productType?: string;
  manufacturer?: string;
  manufacturerRating?: number;
  qualityScore?: number;
  deliveryScore?: number;
  costScore?: number;
  overallScore?: number;
  approvedBy?: string;
  approvedAt?: Date;
  warrantyExpiry?: Date;
  estimatedDelivery?: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'inspection' | 'maintenance' | 'repair' | 'survey';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  assignedToRole: string;
  section: string;
  dueDate: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  createdDate: Date;
  estimatedHours: number;
  notes?: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  blockchainHash?: string;
  status: 'success' | 'failed' | 'pending';
}

// Users Collection Service
export class UsersService {
  private static collectionName = 'users';
  private static demoUsers: User[] = [];
  private static isInitialized = false;
  private static subscribers: ((users: User[]) => void)[] = [];

  private static initializeDemoData() {
    if (!this.isInitialized) {
      this.demoUsers = this.getDemoUsers();
      this.isInitialized = true;
    }
  }

  private static notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.demoUsers]));
  }

  static async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate() || new Date(),
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return demo data if Firebase fails
      this.initializeDemoData();
      return [...this.demoUsers];
    }
  }

  static async addUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding user, using demo mode:', error);
      // Fallback to demo mode - add to in-memory array
      this.initializeDemoData();
      const newUser: User = {
        id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      this.demoUsers.push(newUser);
      
      // Notify all subscribers of the new user
      this.notifySubscribers();
      
      return newUser.id;
    }
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, userId), {
        ...userData,
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    try {
      return onSnapshot(collection(db, this.collectionName), (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastLogin: doc.data().lastLogin?.toDate() || new Date(),
        })) as User[];
        callback(users);
      });
    } catch (error) {
      console.error('Error subscribing to users, using demo mode:', error);
      this.initializeDemoData();
      
      // Add subscriber to demo mode subscriber list
      this.subscribers.push(callback);
      
      // Immediately call with current data
      callback([...this.demoUsers]);
      
      // Return unsubscribe function
      return () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    }
  }

  private static getDemoUsers(): User[] {
    return [
      {
        id: '1',
        email: 'admin@railway.gov.in',
        name: 'Rajesh Kumar (Admin)',
        role: 'admin',
        division: 'Central Railway',
        section: 'Mumbai Division',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '2',
        email: 'drm@railway.gov.in',
        name: 'Priya Sharma (DRM)',
        role: 'drm',
        division: 'Western Railway',
        section: 'Ahmedabad Division',
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2024-01-19')
      },
      {
        id: '3',
        email: 'inspector@railway.gov.in',
        name: 'Amit Singh (Inspector)',
        role: 'inspector',
        division: 'Northern Railway',
        section: 'Delhi Division',
        createdAt: new Date('2024-01-12'),
        lastLogin: new Date('2024-01-18')
      },
      {
        id: '4',
        email: 'den@railway.gov.in',
        name: 'Sunita Patel (DEN)',
        role: 'den',
        division: 'Southern Railway',
        section: 'Chennai Division',
        createdAt: new Date('2024-01-14'),
        lastLogin: new Date('2024-01-21')
      },
      {
        id: '5',
        email: 'manufacturer@railway.gov.in',
        name: 'Vikram Industries (Manufacturer)',
        role: 'manufacturer',
        division: 'Eastern Railway',
        section: 'Kolkata Division',
        createdAt: new Date('2024-01-16'),
        lastLogin: new Date('2024-01-22')
      },
      // Additional users for comprehensive testing
      {
        id: '6',
        email: 'inspector2@railway.gov.in',
        name: 'Deepak Verma (Inspector)',
        role: 'inspector',
        division: 'South Central Railway',
        section: 'Hyderabad Division',
        createdAt: new Date('2024-01-08'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '7',
        email: 'inspector3@railway.gov.in',
        name: 'Kavita Reddy (Inspector)',
        role: 'inspector',
        division: 'East Coast Railway',
        section: 'Bhubaneswar Division',
        createdAt: new Date('2024-01-05'),
        lastLogin: new Date('2024-01-19')
      },
      {
        id: '8',
        email: 'den2@railway.gov.in',
        name: 'Manoj Gupta (DEN)',
        role: 'den',
        division: 'North Western Railway',
        section: 'Jodhpur Division',
        createdAt: new Date('2024-01-07'),
        lastLogin: new Date('2024-01-21')
      },
      {
        id: '9',
        email: 'drm2@railway.gov.in',
        name: 'Anita Rao (DRM)',
        role: 'drm',
        division: 'South Eastern Railway',
        section: 'Kharagpur Division',
        createdAt: new Date('2024-01-09'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '10',
        email: 'manufacturer2@railway.gov.in',
        name: 'Steel Works India Ltd.',
        role: 'manufacturer',
        division: 'North Central Railway',
        section: 'Allahabad Division',
        createdAt: new Date('2024-01-11'),
        lastLogin: new Date('2024-01-22')
      },
      {
        id: '11',
        email: 'inspector4@railway.gov.in',
        name: 'Ravi Kumar (Inspector)',
        role: 'inspector',
        division: 'South Western Railway',
        section: 'Hubli Division',
        createdAt: new Date('2024-01-13'),
        lastLogin: new Date('2024-01-18')
      },
      {
        id: '12',
        email: 'inspector5@railway.gov.in',
        name: 'Pooja Sharma (Inspector)',
        role: 'inspector',
        division: 'North East Frontier Railway',
        section: 'Guwahati Division',
        createdAt: new Date('2024-01-17'),
        lastLogin: new Date('2024-01-21')
      }
    ];
  }
}

// Products Collection Service
export class ProductsService {
  private static collectionName = 'products';

  static async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        manufacturedDate: doc.data().manufacturedDate?.toDate() || new Date(),
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.getDemoProducts();
    }
  }

  static async addProduct(productData: Omit<Product, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), productData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  }

  static async updateProduct(productId: string, productData: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, productId), productData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  static subscribeToProducts(callback: (products: Product[]) => void): () => void {
    try {
      return onSnapshot(collection(db, this.collectionName), (snapshot) => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          manufacturedDate: doc.data().manufacturedDate?.toDate() || new Date(),
        })) as Product[];
        callback(products);
      });
    } catch (error) {
      console.error('Error subscribing to products:', error);
      callback(this.getDemoProducts());
      return () => {};
    }
  }

  private static getDemoProducts(): Product[] {
    return [
      {
        id: 'RAIL-JOINT-RJ456',
        name: 'Heavy Duty Rail Joint',
        category: 'Rail Components',
        manufacturer: 'Steel Works India Ltd.',
        batchNumber: 'BATCH2024-001',
        qrCode: 'QR-RJ456-2024',
        blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        manufacturedDate: new Date('2024-01-15'),
        status: 'installed',
        location: 'Track Section A-123, Mumbai Division'
      },
      {
        id: 'SIGNAL-BOX-SB789',
        name: 'Digital Signal Control Box',
        category: 'Signaling Equipment',
        manufacturer: 'Railway Electronics Corp.',
        batchNumber: 'BATCH2024-002',
        qrCode: 'QR-SB789-2024',
        blockchainHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        manufacturedDate: new Date('2024-01-10'),
        status: 'maintenance',
        location: 'Signal Post SP-45, Delhi Division'
      },
      {
        id: 'TRACK-BOLT-TB321',
        name: 'High Tensile Track Bolt',
        category: 'Fastening Systems',
        manufacturer: 'Precision Fasteners Ltd.',
        batchNumber: 'BATCH2024-003',
        qrCode: 'QR-TB321-2024',
        blockchainHash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        manufacturedDate: new Date('2024-01-12'),
        status: 'dispatched',
        location: 'In Transit to Chennai Division'
      },
      {
        id: 'SLEEPER-SL654',
        name: 'Prestressed Concrete Sleeper',
        category: 'Track Components',
        manufacturer: 'Concrete Industries India',
        batchNumber: 'BATCH2024-004',
        qrCode: 'QR-SL654-2024',
        blockchainHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        manufacturedDate: new Date('2024-01-08'),
        status: 'installed',
        location: 'Track Section B-456, Kolkata Division'
      },
      {
        id: 'SWITCH-SW987',
        name: 'Automatic Track Switch',
        category: 'Track Components',
        manufacturer: 'Advanced Railway Systems',
        batchNumber: 'BATCH2024-005',
        qrCode: 'QR-SW987-2024',
        blockchainHash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        manufacturedDate: new Date('2024-01-05'),
        status: 'inspected',
        location: 'Junction J-12, Hyderabad Division'
      },
      {
        id: 'BEARING-BR111',
        name: 'Heavy Duty Bearing Assembly',
        category: 'Rail Components',
        manufacturer: 'Bearing Technologies Ltd.',
        batchNumber: 'BATCH2024-006',
        qrCode: 'QR-BR111-2024',
        blockchainHash: '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        manufacturedDate: new Date('2024-01-20'),
        status: 'manufactured',
        location: 'Warehouse W-5, Ahmedabad Division'
      },
      {
        id: 'CABLE-CB222',
        name: 'Signaling Cable Assembly',
        category: 'Signaling Equipment',
        manufacturer: 'Cable Systems India',
        batchNumber: 'BATCH2024-007',
        qrCode: 'QR-CB222-2024',
        blockchainHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        manufacturedDate: new Date('2024-01-18'),
        status: 'dispatched',
        location: 'In Transit to Bhubaneswar Division'
      },
      {
        id: 'CLIP-CL333',
        name: 'Rail Clip System',
        category: 'Fastening Systems',
        manufacturer: 'Fastening Solutions Ltd.',
        batchNumber: 'BATCH2024-008',
        qrCode: 'QR-CL333-2024',
        blockchainHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
        manufacturedDate: new Date('2024-01-22'),
        status: 'installed',
        location: 'Track Section C-789, Jodhpur Division'
      },
      {
        id: 'SENSOR-SN444',
        name: 'Smart Track Sensor',
        category: 'Signaling Equipment',
        manufacturer: 'IoT Railway Solutions',
        batchNumber: 'BATCH2024-009',
        qrCode: 'QR-SN444-2024',
        blockchainHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        manufacturedDate: new Date('2024-01-25'),
        status: 'inspected',
        location: 'Track Section D-012, Guwahati Division'
      },
      {
        id: 'BALLAST-BL555',
        name: 'Premium Track Ballast',
        category: 'Track Components',
        manufacturer: 'Stone Aggregates India',
        batchNumber: 'BATCH2024-010',
        qrCode: 'QR-BL555-2024',
        blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789a',
        manufacturedDate: new Date('2024-01-28'),
        status: 'installed',
        location: 'Track Section E-345, Hubli Division'
      }
    ];
  }
}

// Inspections Collection Service
export class InspectionsService {
  private static collectionName = 'inspections';

  static async getInspections(): Promise<Inspection[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Inspection[];
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return this.getDemoInspections();
    }
  }

  static async addInspection(inspectionData: Omit<Inspection, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...inspectionData,
        date: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding inspection:', error);
      throw new Error('Failed to add inspection');
    }
  }

  static async updateInspection(inspectionId: string, inspectionData: Partial<Inspection>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, inspectionId), inspectionData);
    } catch (error) {
      console.error('Error updating inspection:', error);
      throw new Error('Failed to update inspection');
    }
  }

  static subscribeToInspections(callback: (inspections: Inspection[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, this.collectionName), orderBy('date', 'desc')),
        (snapshot) => {
          const inspections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          })) as Inspection[];
          callback(inspections);
        }
      );
    } catch (error) {
      console.error('Error subscribing to inspections:', error);
      callback(this.getDemoInspections());
      return () => {};
    }
  }

  private static getDemoInspections(): Inspection[] {
    return [
      {
        id: 'INSP-2024-001',
        productId: 'RAIL-JOINT-RJ456',
        inspectorId: '3',
        inspectorName: 'Amit Singh (Inspector)',
        date: new Date('2024-01-20'),
        status: 'passed',
        notes: 'Rail joint in excellent condition. All bolts properly tightened. No signs of wear or corrosion detected. Gauge measurements within specification.',
        images: ['rj456_overview.jpg', 'rj456_bolts.jpg', 'rj456_gauge_check.jpg'],
        blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        location: 'Track Section A-123, Mumbai Division'
      },
      {
        id: 'INSP-2024-002',
        productId: 'SIGNAL-BOX-SB789',
        inspectorId: '6',
        inspectorName: 'Deepak Verma (Inspector)',
        date: new Date('2024-01-21'),
        status: 'failed',
        notes: 'Signal control box showing response delays. LED indicators intermittent. Requires immediate attention - safety critical issue identified.',
        images: ['sb789_control_panel.jpg', 'sb789_wiring.jpg', 'sb789_led_test.jpg'],
        blockchainHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        location: 'Signal Post SP-45, Delhi Division'
      },
      {
        id: 'INSP-2024-003',
        productId: 'TRACK-BOLT-TB321',
        inspectorId: '7',
        inspectorName: 'Kavita Reddy (Inspector)',
        date: new Date('2024-01-19'),
        status: 'passed',
        notes: 'High tensile track bolts performing as expected. Torque values verified. Anti-corrosion coating intact.',
        images: ['tb321_torque_test.jpg', 'tb321_coating.jpg'],
        blockchainHash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        location: 'Track Section B-456, Chennai Division'
      },
      {
        id: 'INSP-2024-004',
        productId: 'SLEEPER-SL654',
        inspectorId: '11',
        inspectorName: 'Ravi Kumar (Inspector)',
        date: new Date('2024-01-18'),
        status: 'passed',
        notes: 'Prestressed concrete sleeper shows no signs of cracking. Load bearing capacity verified. Alignment perfect.',
        images: ['sl654_surface.jpg', 'sl654_load_test.jpg', 'sl654_alignment.jpg'],
        blockchainHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        location: 'Track Section B-456, Kolkata Division'
      },
      {
        id: 'INSP-2024-005',
        productId: 'SWITCH-SW987',
        inspectorId: '12',
        inspectorName: 'Pooja Sharma (Inspector)',
        date: new Date('2024-01-17'),
        status: 'pending',
        notes: 'Automatic track switch mechanism requires lubrication. Scheduled for maintenance next week.',
        images: ['sw987_mechanism.jpg', 'sw987_control.jpg'],
        blockchainHash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        location: 'Junction J-12, Hyderabad Division'
      },
      {
        id: 'INSP-2024-006',
        productId: 'BEARING-BR111',
        inspectorId: '3',
        inspectorName: 'Amit Singh (Inspector)',
        date: new Date('2024-01-22'),
        status: 'passed',
        notes: 'Heavy duty bearing assembly running smoothly. Temperature within normal range. Lubrication levels adequate.',
        images: ['br111_thermal.jpg', 'br111_lubrication.jpg'],
        blockchainHash: '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        location: 'Warehouse W-5, Ahmedabad Division'
      },
      {
        id: 'INSP-2024-007',
        productId: 'CABLE-CB222',
        inspectorId: '6',
        inspectorName: 'Deepak Verma (Inspector)',
        date: new Date('2024-01-16'),
        status: 'failed',
        notes: 'Signaling cable showing signs of insulation wear. Conductivity test failed. Immediate replacement required.',
        images: ['cb222_insulation.jpg', 'cb222_conductivity.jpg', 'cb222_damage.jpg'],
        blockchainHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        location: 'Cable Route CR-15, Bhubaneswar Division'
      },
      {
        id: 'INSP-2024-008',
        productId: 'CLIP-CL333',
        inspectorId: '7',
        inspectorName: 'Kavita Reddy (Inspector)',
        date: new Date('2024-01-23'),
        status: 'passed',
        notes: 'Rail clip system functioning properly. Spring tension optimal. No visible fatigue signs.',
        images: ['cl333_spring.jpg', 'cl333_tension.jpg'],
        blockchainHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
        location: 'Track Section C-789, Jodhpur Division'
      },
      {
        id: 'INSP-2024-009',
        productId: 'SENSOR-SN444',
        inspectorId: '11',
        inspectorName: 'Ravi Kumar (Inspector)',
        date: new Date('2024-01-25'),
        status: 'passed',
        notes: 'Smart track sensor calibrated and responding accurately. IoT connectivity stable. Data transmission verified.',
        images: ['sn444_calibration.jpg', 'sn444_connectivity.jpg'],
        blockchainHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        location: 'Track Section D-012, Guwahati Division'
      },
      {
        id: 'INSP-2024-010',
        productId: 'BALLAST-BL555',
        inspectorId: '12',
        inspectorName: 'Pooja Sharma (Inspector)',
        date: new Date('2024-01-28'),
        status: 'passed',
        notes: 'Premium track ballast properly distributed. Drainage excellent. No settlement issues detected.',
        images: ['bl555_distribution.jpg', 'bl555_drainage.jpg'],
        blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789a',
        location: 'Track Section E-345, Hubli Division'
      },
      {
        id: 'INSP-2024-011',
        productId: 'RAIL-JOINT-RJ456',
        inspectorId: '6',
        inspectorName: 'Deepak Verma (Inspector)',
        date: new Date('2024-01-15'),
        status: 'failed',
        notes: 'Previous inspection - Bolt loosening detected. Vibration analysis showed abnormal patterns. Maintenance completed.',
        images: ['rj456_vibration.jpg', 'rj456_loose_bolts.jpg'],
        blockchainHash: '0x1b2c3d4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890',
        location: 'Track Section A-123, Mumbai Division'
      },
      {
        id: 'INSP-2024-012',
        productId: 'SIGNAL-BOX-SB789',
        inspectorId: '7',
        inspectorName: 'Kavita Reddy (Inspector)',
        date: new Date('2024-01-14'),
        status: 'pending',
        notes: 'Routine maintenance scheduled. System performance monitoring in progress.',
        images: ['sb789_routine.jpg'],
        blockchainHash: '0x2c3d4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890ab',
        location: 'Signal Post SP-45, Delhi Division'
      }
    ];
  }
}

// Analytics and Dashboard Data Service
export class AnalyticsService {
  static async getDashboardData(userRole: UserRole) {
    try {
      const users = await UsersService.getUsers();
      const products = await ProductsService.getProducts();
      const inspections = await InspectionsService.getInspections();

      return {
        users,
        products,
        inspections,
        summary: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.lastLogin && u.lastLogin > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
          totalProducts: products.length,
          totalInspections: inspections.length,
          passedInspections: inspections.filter(i => i.status === 'passed').length,
          failedInspections: inspections.filter(i => i.status === 'failed').length,
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return this.getDemoDashboardData();
    }
  }

  private static getDemoDashboardData() {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@railway.gov.in',
        name: 'Admin User',
        role: 'admin' as const,
        division: 'Central Railway',
        section: 'Mumbai Division',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '2',
        email: 'drm@railway.gov.in',
        name: 'DRM User',
        role: 'drm' as const,
        division: 'Western Railway',
        section: 'Ahmedabad Division',
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2024-01-19')
      }
    ];

    const demoProducts = [
      {
        id: 'prod-001',
        name: 'Heavy Duty Rail Joint',
        category: 'Rail Components',
        manufacturer: 'ABC Rail Industries',
        batchNumber: 'RJ-2024-001',
        qrCode: 'QR001234567',
        blockchainHash: 'hash001',
        manufacturedDate: new Date('2024-01-10'),
        status: 'installed' as const,
        location: 'Track Section A-1'
      }
    ];

    const demoInspections = [
      {
        id: 'insp-001',
        productId: 'prod-001',
        inspectorId: '3',
        inspectorName: 'Inspector User',
        date: new Date('2024-01-20'),
        status: 'passed' as const,
        notes: 'All parameters within acceptable limits',
        images: [],
        blockchainHash: 'insp_hash_001',
        location: 'Track Section A-1'
      }
    ];

    return {
      users: demoUsers,
      products: demoProducts,
      inspections: demoInspections,
      summary: {
        totalUsers: 5,
        activeUsers: 4,
        totalProducts: 2,
        totalInspections: 2,
        passedInspections: 1,
        failedInspections: 1,
      }
    };
  }
}

// Approval Requests Service
export class ApprovalRequestsService {
  private static collectionName = 'approvalRequests';
  private static demoRequests: ApprovalRequest[] = [];
  private static isInitialized = false;
  private static subscribers: ((requests: ApprovalRequest[]) => void)[] = [];

  private static initializeDemoData() {
    if (!this.isInitialized) {
      this.demoRequests = this.getDemoApprovalRequests();
      this.isInitialized = true;
    }
  }

  private static notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.demoRequests]));
  }

  static async getApprovalRequests(): Promise<ApprovalRequest[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ApprovalRequest[];
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      this.initializeDemoData();
      return [...this.demoRequests];
    }
  }

  static subscribeToApprovalRequests(callback: (requests: ApprovalRequest[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, this.collectionName), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as ApprovalRequest[];
          callback(requests);
        }
      );
    } catch (error) {
      console.error('Error subscribing to approval requests, using demo mode:', error);
      this.initializeDemoData();
      
      // Add subscriber to demo mode subscriber list
      this.subscribers.push(callback);
      
      // Immediately call with current data
      callback([...this.demoRequests]);
      
      // Return unsubscribe function
      return () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    }
  }

  static async addApprovalRequest(requestData: Omit<ApprovalRequest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...requestData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding approval request, using demo mode:', error);
      // Fallback to demo mode - add to in-memory array
      this.initializeDemoData();
      const newRequest: ApprovalRequest = {
        id: `REQ-${Date.now()}`,
        ...requestData,
        createdAt: new Date()
      };
      this.demoRequests.unshift(newRequest); // Add to beginning for newest first
      
      // Notify all subscribers of the new request
      this.notifySubscribers();
      
      return newRequest.id;
    }
  }

  static async updateApprovalRequest(requestId: string, updates: Partial<ApprovalRequest>, approverName?: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      await updateDoc(docRef, {
        ...updates,
        ...(updates.status === 'approved' && {
          approvedBy: approverName,
          approvedAt: serverTimestamp(),
          // Calculate warranty expiry and delivery estimate for approved requests
          ...(updates.type !== 'budget' && {
            warrantyExpiry: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000) + (Math.random() * 365 * 24 * 60 * 60 * 1000)), // 1-2 years
            estimatedDelivery: new Date(Date.now() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000) // 1-4 weeks
          })
        })
      });
    } catch (error) {
      console.error('Error updating approval request, using demo mode:', error);
      // Fallback to demo mode - update in-memory array
      this.initializeDemoData();
      const requestIndex = this.demoRequests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        this.demoRequests[requestIndex] = {
          ...this.demoRequests[requestIndex],
          ...updates,
          ...(updates.status === 'approved' && {
            approvedBy: approverName,
            approvedAt: new Date(),
            // Calculate warranty expiry and delivery estimate for approved requests
            ...(updates.type !== 'budget' && {
              warrantyExpiry: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000) + (Math.random() * 365 * 24 * 60 * 60 * 1000)), // 1-2 years
              estimatedDelivery: new Date(Date.now() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000) // 1-4 weeks
            })
          })
        };
        
        // Notify all subscribers of the update
        this.notifySubscribers();
      }
    }
  }

  private static getDemoApprovalRequests(): ApprovalRequest[] {
    return [
      {
        id: 'REQ-2024-001',
        type: 'budget',
        title: 'Track Modernization Project - Phase 2',
        requestedBy: 'Manoj Gupta (DEN)',
        requestedByRole: 'DEN',
        amount: 5000000,
        description: 'Additional budget allocation required for Phase 2 of track modernization project covering sections A-123 to A-156. Includes rail replacement, ballast upgrade, and signaling enhancement.',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2024-01-25T10:30:00'),
        documents: ['track-modernization-proposal.pdf', 'cost-breakdown.xlsx', 'technical-specifications.pdf'],
        category: 'Infrastructure',
        productType: 'Track Components',
        manufacturer: 'Multiple Vendors',
        manufacturerRating: 4.7,
        qualityScore: 92,
        deliveryScore: 88,
        costScore: 85,
        overallScore: 89
      },
      {
        id: 'REQ-2024-002',
        type: 'product',
        title: 'Emergency Rail Joint Replacement - Critical',
        requestedBy: 'Amit Singh (Inspector)',
        requestedByRole: 'Inspector',
        amount: 875000,
        description: 'URGENT: 50 heavy-duty rail joints required for emergency replacement in high-traffic section. Safety inspection revealed critical wear patterns requiring immediate action.',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2024-01-24T14:15:00'),
        documents: ['emergency-inspection-report.pdf', 'safety-assessment.pdf'],
        category: 'Rail Joints',
        productType: 'Rail Components',
        manufacturer: 'Steel Works India Ltd.',
        manufacturerRating: 4.8,
        qualityScore: 95,
        deliveryScore: 92,
        costScore: 87,
        overallScore: 93
      },
      {
        id: 'REQ-2024-003',
        type: 'product',
        title: 'Signal Equipment Upgrade Package',
        requestedBy: 'Kavita Reddy (Inspector)',
        requestedByRole: 'Inspector',
        amount: 1200000,
        description: 'Comprehensive signal equipment upgrade for sections B-456 to B-489. Includes digital control boxes, LED signals, and IoT sensors.',
        priority: 'medium',
        status: 'approved',
        createdAt: new Date('2024-01-20T09:20:00'),
        approvedBy: 'Sunita Patel (DEN)',
        approvedAt: new Date('2024-01-21T11:30:00'),
        warrantyExpiry: new Date('2025-01-21T11:30:00'),
        estimatedDelivery: new Date('2024-02-18T09:00:00'),
        documents: ['signal-upgrade-specs.pdf', 'compatibility-analysis.pdf'],
        category: 'Signal Equipment',
        productType: 'Signaling Equipment',
        manufacturer: 'Railway Electronics Corp.',
        manufacturerRating: 4.6,
        qualityScore: 91,
        deliveryScore: 89,
        costScore: 84,
        overallScore: 88
      },
      {
        id: 'REQ-2024-004',
        type: 'maintenance',
        title: 'Preventive Maintenance - Track Bolts',
        requestedBy: 'Deepak Verma (Inspector)',
        requestedByRole: 'Inspector',
        amount: 250000,
        description: 'Scheduled preventive maintenance for track bolt systems across sections C-789 to C-812. Includes torque verification, anti-corrosion treatment, and replacement of worn components.',
        priority: 'medium',
        status: 'approved',
        createdAt: new Date('2024-01-18T16:45:00'),
        approvedBy: 'Manoj Gupta (DEN)',
        approvedAt: new Date('2024-01-19T10:15:00'),
        warrantyExpiry: new Date('2024-07-19T10:15:00'),
        estimatedDelivery: new Date('2024-02-02T14:00:00'),
        documents: ['maintenance-schedule.pdf', 'bolt-inspection-report.pdf'],
        category: 'Maintenance Tools',
        productType: 'Fastening Systems',
        manufacturer: 'Precision Fasteners Ltd.',
        manufacturerRating: 4.3,
        qualityScore: 88,
        deliveryScore: 85,
        costScore: 90,
        overallScore: 87
      },
      {
        id: 'REQ-2024-005',
        type: 'project',
        title: 'Smart Track Monitoring System Implementation',
        requestedBy: 'Pooja Sharma (Inspector)',
        requestedByRole: 'Inspector',
        amount: 3500000,
        description: 'Implementation of IoT-based smart track monitoring system for real-time condition assessment. Covers installation of sensors, data analytics platform, and integration with existing systems.',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date('2024-01-22T12:00:00'),
        documents: ['iot-project-proposal.pdf', 'technology-assessment.pdf', 'roi-analysis.xlsx'],
        category: 'IoT Systems',
        productType: 'Smart Technology',
        manufacturer: 'IoT Railway Solutions',
        manufacturerRating: 4.4,
        qualityScore: 89,
        deliveryScore: 82,
        costScore: 86,
        overallScore: 85
      },
      {
        id: 'REQ-2024-006',
        type: 'product',
        title: 'Concrete Sleepers Replacement - Batch 2',
        requestedBy: 'Ravi Kumar (Inspector)',
        requestedByRole: 'Inspector',
        amount: 1800000,
        description: 'Replacement of 200 concrete sleepers showing stress fractures in high-load sections. Quality control inspection revealed manufacturing defects requiring immediate replacement.',
        priority: 'high',
        status: 'rejected',
        createdAt: new Date('2024-01-15T08:30:00'),
        documents: ['sleeper-defect-analysis.pdf', 'structural-assessment.pdf'],
        category: 'Sleepers',
        productType: 'Track Components',
        manufacturer: 'Concrete Industries India',
        manufacturerRating: 3.9,
        qualityScore: 78,
        deliveryScore: 81,
        costScore: 88,
        overallScore: 82
      },
      {
        id: 'REQ-2024-007',
        type: 'budget',
        title: 'Safety Equipment Procurement - Annual',
        requestedBy: 'Anita Rao (DRM)',
        requestedByRole: 'DRM',
        amount: 2200000,
        description: 'Annual procurement budget for safety equipment including helmets, safety harnesses, communication devices, and emergency response tools for field operations.',
        priority: 'medium',
        status: 'approved',
        createdAt: new Date('2024-01-16T13:45:00'),
        approvedBy: 'Rajesh Kumar (Admin)',
        approvedAt: new Date('2024-01-17T09:20:00'),
        documents: ['safety-equipment-catalog.pdf', 'annual-requirement-analysis.xlsx'],
        category: 'Safety Equipment',
        productType: 'Safety Equipment',
        manufacturer: 'Multiple Vendors',
        manufacturerRating: 4.5,
        qualityScore: 93,
        deliveryScore: 90,
        costScore: 85,
        overallScore: 89
      },
      {
        id: 'REQ-2024-008',
        type: 'maintenance',
        title: 'Ballast Cleaning and Grading - Section D',
        requestedBy: 'Deepak Verma (Inspector)',
        requestedByRole: 'Inspector',
        amount: 450000,
        description: 'Comprehensive ballast cleaning and grading operation for section D-012 to D-045. Drainage issues and fouling detected requiring mechanical cleaning.',
        priority: 'low',
        status: 'pending',
        createdAt: new Date('2024-01-23T11:15:00'),
        documents: ['ballast-condition-report.pdf', 'drainage-assessment.pdf'],
        category: 'Track Maintenance',
        productType: 'Track Components',
        manufacturer: 'Track Maintenance Corp.',
        manufacturerRating: 4.2,
        qualityScore: 86,
        deliveryScore: 88,
        costScore: 92,
        overallScore: 88
      }
    ];
  }
}

// Tasks Service
export class TasksService {
  private static collectionName = 'tasks';
  private static demoTasks: Task[] = [];
  private static isInitialized = false;
  private static subscribers: ((tasks: Task[]) => void)[] = [];

  private static initializeDemoData() {
    if (!this.isInitialized) {
      this.demoTasks = this.getDemoTasks();
      this.isInitialized = true;
    }
  }

  private static notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.demoTasks]));
  }

  static async getTasks(): Promise<Task[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy('createdDate', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || new Date(),
        createdDate: doc.data().createdDate?.toDate() || new Date(),
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      this.initializeDemoData();
      return [...this.demoTasks];
    }
  }

  static subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, this.collectionName), orderBy('createdDate', 'desc')),
        (snapshot) => {
          const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate() || new Date(),
            createdDate: doc.data().createdDate?.toDate() || new Date(),
          })) as Task[];
          callback(tasks);
        }
      );
    } catch (error) {
      console.error('Error subscribing to tasks, using demo mode:', error);
      this.initializeDemoData();
      
      // Add subscriber to demo mode subscriber list
      this.subscribers.push(callback);
      
      // Immediately call with current data
      callback([...this.demoTasks]);
      
      // Return unsubscribe function
      return () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    }
  }

  static async addTask(taskData: Omit<Task, 'id' | 'createdDate'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...taskData,
        createdDate: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding task, using demo mode:', error);
      // Fallback to demo mode - add to in-memory array
      this.initializeDemoData();
      const newTask: Task = {
        id: `TASK-${Date.now()}`,
        ...taskData,
        createdDate: new Date()
      };
      this.demoTasks.unshift(newTask); // Add to beginning for newest first
      
      // Notify all subscribers of the new task
      this.notifySubscribers();
      
      return newTask.id;
    }
  }

  private static getDemoTasks(): Task[] {
    return [
      {
        id: 'TASK-2024-001',
        title: 'Emergency Track Inspection - High Priority',
        description: 'Immediate comprehensive track inspection required for Section A-123 following unusual vibration reports from train operators. Check rail condition, joint integrity, fastener status, and alignment.',
        type: 'inspection',
        priority: 'high',
        assignedTo: 'Amit Singh (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section A-123, Mumbai Division',
        dueDate: new Date('2024-01-30T08:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-25T14:30:00'),
        estimatedHours: 8,
        notes: 'Priority task - Safety critical. Focus on high-traffic areas and recent maintenance zones. Report any anomalies immediately.'
      },
      {
        id: 'TASK-2024-002',
        title: 'Rail Joint Replacement - Scheduled Maintenance',
        description: 'Replace 15 worn rail joints in Section B-456 as identified in previous inspection report INS-2024-003. Use new heavy-duty joints from approved vendor.',
        type: 'maintenance',
        priority: 'medium',
        assignedTo: 'Deepak Verma (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section B-456, Chennai Division',
        dueDate: new Date('2024-02-05T10:00:00'),
        status: 'in_progress',
        createdDate: new Date('2024-01-22T09:15:00'),
        estimatedHours: 16,
        notes: 'Materials already ordered and delivered to site. Coordinate with traffic control for 4-hour window.'
      },
      {
        id: 'TASK-2024-003',
        title: 'Signal System Calibration - Digital Upgrade',
        description: 'Calibrate and test newly installed digital signal control boxes in Section C-789. Verify communication with central control and emergency response protocols.',
        type: 'inspection',
        priority: 'high',
        assignedTo: 'Kavita Reddy (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section C-789, Jodhpur Division',
        dueDate: new Date('2024-02-01T12:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-24T16:45:00'),
        estimatedHours: 12,
        notes: 'Critical for safety - New digital system requires thorough testing before activation.'
      },
      {
        id: 'TASK-2024-004',
        title: 'Track Ballast Inspection and Cleaning',
        description: 'Comprehensive ballast inspection for drainage issues in Section D-012. Clean fouled ballast and assess need for replacement in problem areas.',
        type: 'maintenance',
        priority: 'medium',
        assignedTo: 'Ravi Kumar (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section D-012, Guwahati Division',
        dueDate: new Date('2024-02-08T07:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-23T11:20:00'),
        estimatedHours: 20,
        notes: 'Heavy machinery required for cleaning. Arrange tamping machine and ballast supply.'
      },
      {
        id: 'TASK-2024-005',
        title: 'Concrete Sleeper Stress Analysis',
        description: 'Detailed stress analysis of concrete sleepers showing micro-cracks in Section E-345. Use ultrasonic testing equipment to assess structural integrity.',
        type: 'inspection',
        priority: 'high',
        assignedTo: 'Pooja Sharma (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section E-345, Hubli Division',
        dueDate: new Date('2024-01-31T14:00:00'),
        status: 'in_progress',
        createdDate: new Date('2024-01-20T13:30:00'),
        estimatedHours: 10,
        notes: 'Use specialized ultrasonic testing equipment. Document all findings with photos and measurements.'
      },
      {
        id: 'TASK-2024-006',
        title: 'IoT Sensor Installation and Testing',
        description: 'Install and configure smart track monitoring sensors for real-time condition assessment. Set up data connectivity and test alert systems.',
        type: 'maintenance',
        priority: 'medium',
        assignedTo: 'Amit Singh (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section F-678, Bhubaneswar Division',
        dueDate: new Date('2024-02-10T09:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-26T10:15:00'),
        estimatedHours: 14,
        notes: 'New IoT project - Ensure proper calibration and network connectivity. Training provided by vendor.'
      },
      {
        id: 'TASK-2024-007',
        title: 'Emergency Bridge Inspection',
        description: 'Emergency structural inspection of railway bridge RB-456 following minor earthquake activity. Check for any structural damage or displacement.',
        type: 'inspection',
        priority: 'high',
        assignedTo: 'Deepak Verma (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Bridge RB-456, Hyderabad Division',
        dueDate: new Date('2024-01-29T06:00:00'),
        status: 'completed',
        createdDate: new Date('2024-01-27T15:45:00'),
        estimatedHours: 6,
        notes: 'COMPLETED: No structural damage found. Bridge cleared for normal operations. Full report filed.'
      },
      {
        id: 'TASK-2024-008',
        title: 'Fastener Torque Verification Program',
        description: 'Systematic verification of fastener torque values across Section G-901. Replace any fasteners not meeting specification requirements.',
        type: 'maintenance',
        priority: 'low',
        assignedTo: 'Kavita Reddy (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section G-901, Kolkata Division',
        dueDate: new Date('2024-02-12T11:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-21T08:30:00'),
        estimatedHours: 18,
        notes: 'Routine maintenance - Use calibrated torque tools. Document all replacements and adjustments.'
      },
      {
        id: 'TASK-2024-009',
        title: 'Track Geometry Survey - Annual',
        description: 'Annual comprehensive track geometry survey using specialized measurement equipment. Check alignment, gauge, cross-level, and twist parameters.',
        type: 'survey',
        priority: 'medium',
        assignedTo: 'Ravi Kumar (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section H-234, Ahmedabad Division',
        dueDate: new Date('2024-02-15T07:30:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-19T12:00:00'),
        estimatedHours: 24,
        notes: 'Annual survey - Use track geometry car. Submit detailed report with recommendations for corrections.'
      },
      {
        id: 'TASK-2024-010',
        title: 'Level Crossing Gate Mechanism Repair',
        description: 'Repair malfunctioning automatic level crossing gate at LC-789. Replace worn components and test safety interlocking systems.',
        type: 'repair',
        priority: 'high',
        assignedTo: 'Pooja Sharma (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Level Crossing LC-789, Delhi Division',
        dueDate: new Date('2024-01-30T16:00:00'),
        status: 'overdue',
        createdDate: new Date('2024-01-18T14:20:00'),
        estimatedHours: 8,
        notes: 'OVERDUE: Critical safety issue - Manual operation in place. Expedite repairs immediately.'
      },
      {
        id: 'TASK-2024-011',
        title: 'Vegetation Clearance - Track Corridor',
        description: 'Clear vegetation growth along track corridor in Section I-567. Maintain minimum clearance as per safety standards.',
        type: 'maintenance',
        priority: 'low',
        assignedTo: 'Amit Singh (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Section I-567, Chennai Division',
        dueDate: new Date('2024-02-18T08:00:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-28T09:45:00'),
        estimatedHours: 12,
        notes: 'Routine maintenance - Coordinate with local authorities for environmental clearances.'
      },
      {
        id: 'TASK-2024-012',
        title: 'Power Supply Cable Inspection',
        description: 'Comprehensive inspection of overhead power supply cables and support structures. Check for wear, corrosion, and proper tension.',
        type: 'inspection',
        priority: 'medium',
        assignedTo: 'Deepak Verma (Inspector)',
        assignedToRole: 'Inspector',
        section: 'Electrified Section ES-123, Mumbai Division',
        dueDate: new Date('2024-02-20T10:30:00'),
        status: 'assigned',
        createdDate: new Date('2024-01-25T15:15:00'),
        estimatedHours: 16,
        notes: 'Electrical safety protocols mandatory. Coordinate with power control for isolation if needed.'
      }
    ];
  }
}

// Roles Service
export class RolesService {
  private static collectionName = 'roles';
  private static demoRoles: any[] = [];
  private static isInitialized = false;
  private static subscribers: ((roles: any[]) => void)[] = [];

  private static initializeDemoData() {
    if (!this.isInitialized) {
      this.demoRoles = this.getDemoRoles();
      this.isInitialized = true;
    }
  }

  private static notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.demoRoles]));
  }
  
  static async getRoles(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      this.initializeDemoData();
      return [...this.demoRoles];
    }
  }

  static async addRole(roleData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...roleData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding role, using demo mode:', error);
      // Fallback to demo mode - add to in-memory array
      this.initializeDemoData();
      const newRole = {
        id: `role_${Date.now()}`,
        ...roleData,
        createdAt: new Date()
      };
      this.demoRoles.push(newRole);
      
      // Notify all subscribers of the new role
      this.notifySubscribers();
      
      return newRole.id;
    }
  }

  static async deleteRole(roleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, roleId));
    } catch (error) {
      console.error('Error deleting role, using demo mode:', error);
      // Fallback to demo mode - remove from in-memory array
      this.initializeDemoData();
      const index = this.demoRoles.findIndex(role => role.id === roleId);
      if (index > -1) {
        this.demoRoles.splice(index, 1);
        // Notify all subscribers of the deletion
        this.notifySubscribers();
      }
    }
  }

  static subscribeToRoles(callback: (roles: any[]) => void): () => void {
    try {
      return onSnapshot(collection(db, this.collectionName), (snapshot) => {
        const roles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        callback(roles);
      });
    } catch (error) {
      console.error('Error subscribing to roles, using demo mode:', error);
      this.initializeDemoData();
      
      // Add subscriber to demo mode subscriber list
      this.subscribers.push(callback);
      
      // Immediately call with current data
      callback([...this.demoRoles]);
      
      // Return unsubscribe function
      return () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    }
  }

  private static getDemoRoles(): any[] {
    return [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full access to all features and data',
        role: 'admin',
        permissions: [
          'user_create', 'user_edit', 'user_delete', 'role_manage',
          'audit_view', 'audit_export', 'inspection_create', 'inspection_approve',
          'inventory_manage', 'reports_generate', 'settings_modify', 'blockchain_view'
        ],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'DRM',
        description: 'Divisional Regional Manager with overall oversight',
        role: 'drm',
        permissions: [
          'view_section_reports', 'view_subdivision_reports', 'view_inspection_overview',
          'assign_tasks', 'view_inspection_logs', 'manage_approval_requests', 'manage_inspectors'
        ],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'DEN',
        description: 'Divisional Engineer with section and sub-division oversight',
        role: 'den',
        permissions: [
          'view_section_reports', 'view_subdivision_reports', 'view_inspection_overview',
          'assign_tasks', 'view_inspection_logs', 'manage_approval_requests', 'manage_inspectors'
        ],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Field Inspector',
        description: 'Inspectors in the field',
        role: 'inspector',
        permissions: [
          'view_section_reports', 'view_subdivision_reports', 'view_inspection_overview',
          'assign_tasks', 'view_inspection_logs', 'manage_approval_requests', 'manage_inspectors'
        ],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '5',
        name: 'Manufacturer',
        description: 'Manufacturers of inspection equipment',
        role: 'manufacturer',
        permissions: [
          'view_section_reports', 'view_subdivision_reports', 'view_inspection_overview',
          'assign_tasks', 'view_inspection_logs', 'manage_approval_requests', 'manage_inspectors'
        ],
        createdAt: new Date('2024-01-15')
      }
    ];
  }
}

// Audit Logs Service
export class AuditLogsService {
  private static collectionName = 'auditLogs';

  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy('timestamp', 'desc'), limit(100))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as AuditLog[];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return this.getDemoAuditLogs();
    }
  }

  static subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, this.collectionName), orderBy('timestamp', 'desc'), limit(100)),
        (snapshot) => {
          const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as AuditLog[];
          callback(logs);
        }
      );
    } catch (error) {
      console.error('Error subscribing to audit logs:', error);
      callback(this.getDemoAuditLogs());
      return () => {};
    }
  }

  static async logActivity(activityData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, this.collectionName), {
        ...activityData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  private static getDemoAuditLogs(): AuditLog[] {
    return [
      {
        id: 'LOG-2024-001',
        timestamp: new Date('2024-01-28T14:30:00'),
        userId: '3',
        userName: 'Amit Singh (Inspector)',
        action: 'INSPECTION_CREATED',
        resource: 'Product RAIL-JOINT-RJ456',
        details: 'Created comprehensive inspection record for rail joint RJ456 in Section A-123. Status: PASSED',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        status: 'success'
      },
      {
        id: 'LOG-2024-002',
        timestamp: new Date('2024-01-28T13:45:00'),
        userId: '4',
        userName: 'Sunita Patel (DEN)',
        action: 'APPROVAL_GRANTED',
        resource: 'Request REQ-2024-003',
        details: 'Approved Signal Equipment Upgrade Package worth ₹12,00,000 for sections B-456 to B-489',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        status: 'success'
      },
      {
        id: 'LOG-2024-003',
        timestamp: new Date('2024-01-28T12:20:00'),
        userId: '6',
        userName: 'Deepak Verma (Inspector)',
        action: 'TASK_COMPLETED',
        resource: 'Task TASK-2024-007',
        details: 'Completed emergency bridge inspection RB-456. No structural damage found.',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        status: 'success'
      },
      {
        id: 'LOG-2024-004',
        timestamp: new Date('2024-01-28T11:15:00'),
        userId: '1',
        userName: 'Rajesh Kumar (Admin)',
        action: 'USER_CREATED',
        resource: 'User inspector6@railway.gov.in',
        details: 'Created new inspector user account for Northeast Frontier Railway, Guwahati Division',
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'success'
      },
      {
        id: 'LOG-2024-005',
        timestamp: new Date('2024-01-28T10:30:00'),
        userId: '12',
        userName: 'Pooja Sharma (Inspector)',
        action: 'INSPECTION_FAILED',
        resource: 'Product SIGNAL-BOX-SB789',
        details: 'Inspection FAILED for signal control box SB789. Response delays detected, requires immediate attention.',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        status: 'success'
      },
      {
        id: 'LOG-2024-006',
        timestamp: new Date('2024-01-28T09:45:00'),
        userId: '2',
        userName: 'Priya Sharma (DRM)',
        action: 'REPORT_GENERATED',
        resource: 'Division Performance Report',
        details: 'Generated comprehensive division performance report for Western Railway - January 2024',
        ipAddress: '192.168.1.20',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        status: 'success'
      },
      {
        id: 'LOG-2024-007',
        timestamp: new Date('2024-01-28T08:20:00'),
        userId: '7',
        userName: 'Kavita Reddy (Inspector)',
        action: 'PRODUCT_REGISTERED',
        resource: 'Product SENSOR-SN444',
        details: 'Registered new smart track sensor SN444 in inventory for Section D-012',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        status: 'success'
      },
      {
        id: 'LOG-2024-008',
        timestamp: new Date('2024-01-27T16:30:00'),
        userId: '5',
        userName: 'Vikram Industries (Manufacturer)',
        action: 'PRODUCT_SHIPPED',
        resource: 'Order ORD-2024-005',
        details: 'Shipped 50 rail clips to Jodhpur Division. Tracking ID: TRK-2024-045',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
        status: 'success'
      },
      {
        id: 'LOG-2024-009',
        timestamp: new Date('2024-01-27T15:15:00'),
        userId: '8',
        userName: 'Manoj Gupta (DEN)',
        action: 'TASK_ASSIGNED',
        resource: 'Task TASK-2024-010',
        details: 'Assigned high-priority level crossing gate repair task to Pooja Sharma (Inspector)',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        status: 'success'
      },
      {
        id: 'LOG-2024-010',
        timestamp: new Date('2024-01-27T14:00:00'),
        userId: '11',
        userName: 'Ravi Kumar (Inspector)',
        action: 'INSPECTION_CREATED',
        resource: 'Product BALLAST-BL555',
        details: 'Created inspection record for premium track ballast BL555. Drainage and distribution verified.',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789a',
        status: 'success'
      },
      {
        id: 'LOG-2024-011',
        timestamp: new Date('2024-01-27T12:45:00'),
        userId: '1',
        userName: 'Rajesh Kumar (Admin)',
        action: 'SETTINGS_MODIFIED',
        resource: 'System Configuration',
        details: 'Updated system backup frequency to daily and enabled real-time monitoring alerts',
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x1b2c3d4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890',
        status: 'success'
      },
      {
        id: 'LOG-2024-012',
        timestamp: new Date('2024-01-27T11:30:00'),
        userId: '9',
        userName: 'Anita Rao (DRM)',
        action: 'APPROVAL_GRANTED',
        resource: 'Request REQ-2024-007',
        details: 'Approved annual safety equipment procurement budget of ₹22,00,000',
        ipAddress: '192.168.1.21',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x2c3d4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890ab',
        status: 'success'
      },
      {
        id: 'LOG-2024-013',
        timestamp: new Date('2024-01-27T10:15:00'),
        userId: '3',
        userName: 'Amit Singh (Inspector)',
        action: 'LOGIN_SUCCESS',
        resource: 'Authentication System',
        details: 'Successful login from mobile device. Location: Mumbai Division Field Office',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Mobile; Android 12; Railway Tablet)',
        blockchainHash: '0x3d4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        status: 'success'
      },
      {
        id: 'LOG-2024-014',
        timestamp: new Date('2024-01-27T09:20:00'),
        userId: 'unknown',
        userName: 'Unknown User',
        action: 'LOGIN_FAILED',
        resource: 'Authentication System',
        details: 'Failed login attempt with invalid credentials. Email: test@railway.gov.in',
        ipAddress: '203.12.45.67',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x4e5f6790abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'failed'
      },
      {
        id: 'LOG-2024-015',
        timestamp: new Date('2024-01-26T17:45:00'),
        userId: '10',
        userName: 'Steel Works India Ltd.',
        action: 'PRODUCT_DELIVERED',
        resource: 'Order ORD-2024-003',
        details: 'Successfully delivered 15 heavy-duty rail joints to Chennai Division. Quality certificate attached.',
        ipAddress: '203.56.78.90',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        blockchainHash: '0x5f6790abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        status: 'success'
      }
    ];
  }
}