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
      },
      {
        id: 'REQ-003',
        type: 'product',
        title: 'Track Maintenance Tools',
        requestedBy: 'Inspector Patel',
        requestedByRole: 'Inspector',
        amount: 150000,
        description: 'Request for specialized track maintenance tools for Section B-456.',
        priority: 'medium',
        status: 'approved',
        createdAt: new Date('2024-01-15T09:20:00'),
        approvedBy: 'DEN User',
        approvedAt: new Date('2024-01-16T11:30:00'),
        warrantyExpiry: new Date('2025-01-16T11:30:00'), // 1 year warranty
        estimatedDelivery: new Date('2024-01-30T09:00:00'), // 2 weeks delivery
        documents: ['tool-specifications.pdf']
      },
      {
        id: 'REQ-004',
        type: 'maintenance',
        title: 'Signal System Maintenance',
        requestedBy: 'Technician Sharma',
        requestedByRole: 'Technician',
        amount: 75000,
        description: 'Preventive maintenance for signal system in Section C-789.',
        priority: 'low',
        status: 'approved',
        createdAt: new Date('2024-01-10T16:45:00'),
        approvedBy: 'DEN User',
        approvedAt: new Date('2024-01-12T10:15:00'),
        warrantyExpiry: new Date('2024-07-12T10:15:00'), // 6 months warranty for maintenance
        estimatedDelivery: new Date('2024-02-09T14:00:00'), // 4 weeks delivery
        documents: ['maintenance-schedule.pdf']
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