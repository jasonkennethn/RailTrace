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
      return this.getDemoUsers();
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
      console.error('Error adding user:', error);
      throw new Error('Failed to add user');
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
      console.error('Error subscribing to users:', error);
      callback(this.getDemoUsers());
      return () => {};
    }
  }

  private static getDemoUsers(): User[] {
    return [
      {
        id: '1',
        email: 'admin@railway.gov.in',
        name: 'Admin User',
        role: 'admin',
        division: 'Central Railway',
        section: 'Mumbai Division',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '2',
        email: 'drm@railway.gov.in',
        name: 'DRM User',
        role: 'drm',
        division: 'Western Railway',
        section: 'Ahmedabad Division',
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2024-01-19')
      },
      {
        id: '3',
        email: 'inspector@railway.gov.in',
        name: 'Inspector User',
        role: 'inspector',
        division: 'Northern Railway',
        section: 'Delhi Division',
        createdAt: new Date('2024-01-12'),
        lastLogin: new Date('2024-01-18')
      },
      {
        id: '4',
        email: 'den@railway.gov.in',
        name: 'DEN User',
        role: 'den',
        division: 'Southern Railway',
        section: 'Chennai Division',
        createdAt: new Date('2024-01-14'),
        lastLogin: new Date('2024-01-21')
      },
      {
        id: '5',
        email: 'manufacturer@railway.gov.in',
        name: 'Manufacturer User',
        role: 'manufacturer',
        division: 'Eastern Railway',
        section: 'Kolkata Division',
        createdAt: new Date('2024-01-16'),
        lastLogin: new Date('2024-01-22')
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
        id: 'prod-001',
        name: 'Heavy Duty Rail Joint',
        category: 'Rail Components',
        manufacturer: 'ABC Rail Industries',
        batchNumber: 'RJ-2024-001',
        qrCode: 'QR001234567',
        blockchainHash: 'hash001',
        manufacturedDate: new Date('2024-01-10'),
        status: 'installed',
        location: 'Track Section A-1'
      },
      {
        id: 'prod-002',
        name: 'Digital Signal Control Box',
        category: 'Signaling Equipment',
        manufacturer: 'XYZ Signal Tech',
        batchNumber: 'SCB-2024-002',
        qrCode: 'QR001234568',
        blockchainHash: 'hash002',
        manufacturedDate: new Date('2024-01-15'),
        status: 'dispatched',
        location: 'Warehouse B'
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
        id: 'insp-001',
        productId: 'prod-001',
        inspectorId: '3',
        inspectorName: 'Inspector User',
        date: new Date('2024-01-20'),
        status: 'passed',
        notes: 'All parameters within acceptable limits',
        images: [],
        blockchainHash: 'insp_hash_001',
        location: 'Track Section A-1'
      },
      {
        id: 'insp-002',
        productId: 'prod-002',
        inspectorId: '3',
        inspectorName: 'Inspector User',
        date: new Date('2024-01-21'),
        status: 'failed',
        notes: 'Signal response time exceeded threshold',
        images: [],
        blockchainHash: 'insp_hash_002',
        location: 'Signal Box B-2'
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
      return this.getDemoApprovalRequests();
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
      console.error('Error subscribing to approval requests:', error);
      callback(this.getDemoApprovalRequests());
      return () => {};
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
      console.error('Error adding approval request:', error);
      throw new Error('Failed to add approval request');
    }
  }

  private static getDemoApprovalRequests(): ApprovalRequest[] {
    return [
      {
        id: 'REQ-001',
        type: 'budget',
        title: 'Additional Budget for Track Modernization',
        requestedBy: 'Sr. DEN Kumar',
        requestedByRole: 'Sr. DEN',
        amount: 2500000,
        description: 'Request for additional budget allocation for track modernization project in Section A-123.',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2024-01-20T10:30:00'),
        documents: ['budget-proposal.pdf', 'cost-analysis.xlsx']
      },
      {
        id: 'REQ-002',
        type: 'product',
        title: 'Emergency Rail Joint Replacement',
        requestedBy: 'Inspector Singh',
        requestedByRole: 'Inspector',
        description: 'Urgent requirement for 50 heavy-duty rail joints for emergency replacement.',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2024-01-19T14:15:00'),
        documents: ['inspection-report.pdf']
      }
    ];
  }
}

// Tasks Service
export class TasksService {
  private static collectionName = 'tasks';

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
      return this.getDemoTasks();
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
      console.error('Error subscribing to tasks:', error);
      callback(this.getDemoTasks());
      return () => {};
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
      console.error('Error adding task:', error);
      throw new Error('Failed to add task');
    }
  }

  private static getDemoTasks(): Task[] {
    return [
      {
        id: 'TASK-001',
        title: 'Track Inspection - Section A-123',
        description: 'Conduct comprehensive track inspection including rail condition, joint integrity, and fastener status',
        type: 'inspection',
        priority: 'high',
        assignedTo: 'AEN Kumar',
        assignedToRole: 'AEN',
        section: 'Section A-123',
        dueDate: new Date('2024-01-25'),
        status: 'assigned',
        createdDate: new Date('2024-01-20'),
        estimatedHours: 6,
        notes: 'Focus on high-traffic areas and recent maintenance zones'
      },
      {
        id: 'TASK-002',
        title: 'Rail Joint Replacement',
        description: 'Replace worn rail joints in Section B-456 as identified in last inspection',
        type: 'maintenance',
        priority: 'medium',
        assignedTo: 'AEN Sharma',
        assignedToRole: 'AEN',
        section: 'Section B-456',
        dueDate: new Date('2024-01-28'),
        status: 'in_progress',
        createdDate: new Date('2024-01-18'),
        estimatedHours: 12,
        notes: 'Materials already ordered and delivered to site'
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
        id: '1',
        timestamp: new Date('2024-01-20T10:30:00'),
        userId: 'user_123',
        userName: 'Inspector John',
        action: 'INSPECTION_CREATED',
        resource: 'Product RJ-456',
        details: 'Created inspection record for rail joint RJ-456',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Mobile)',
        blockchainHash: '0x123abc456def789',
        status: 'success'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-20T09:15:00'),
        userId: 'user_456',
        userName: 'DRM Smith',
        action: 'APPROVAL_GRANTED',
        resource: 'Inspection Report IR-789',
        details: 'Approved inspection report for track section A-123',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows)',
        blockchainHash: '0x456def789abc123',
        status: 'success'
      }
    ];
  }
}