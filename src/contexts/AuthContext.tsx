import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'approved'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getPendingUsers: () => Promise<User[]>;
  getAllUsers: () => Promise<User[]>;
  isAdminEmail: (email?: string | null) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded admin disabled (use Firebase/Auth only)

  // Hardcoded admin credentials - no approval required
  const ADMIN_EMAILS = useMemo(() => [
    'admin@railtrace.com',
    'admin@railtrace.gov.in',
    'admin@indianrailways.gov.in',
    'hq@railtrace.gov.in'
  ], []);

  const refreshUserData = useCallback(async () => {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ 
            id: currentUser.uid, 
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined
          } as User);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  }, [currentUser]);

  // Ensure admin emails are auto-approved and role is enforced
  const ensureAdminPrivileges = useCallback(async (user: FirebaseUser) => {
    try {
      if (!user?.email) return;
      const email = user.email.toLowerCase();
      if (!ADMIN_EMAILS.includes(email)) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const adminData: User = {
          id: user.uid,
          email,
          name: user.displayName || 'Administrator',
          role: 'admin',
          approved: true,
          createdAt: new Date()
        } as unknown as User;
        await setDoc(userRef, adminData, { merge: true });
        setUserData(adminData);
        return;
      }

      const data = userSnap.data() as User;
      if (data.role !== 'admin' || !data.approved) {
        await setDoc(userRef, { role: 'admin', approved: true }, { merge: true });
      }
    } catch (e) {
      console.error('Failed to ensure admin privileges:', e);
    }
  }, [ADMIN_EMAILS]);

  const register = async (
    email: string, 
    password: string, 
    userDataInput: Omit<User, 'id' | 'createdAt' | 'approved'>
  ) => {
    try {
      // If not using hardcoded admin, go via Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check if this is an admin email - no approval required
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      
      const newUserData: User = {
        ...userDataInput,
        id: user.uid,
        email,
        createdAt: new Date(),
        approved: isAdmin, // Admin accounts auto-approved
        role: isAdmin ? 'admin' : userDataInput.role // Force admin role for admin emails
      };

      console.log('Registering user:', newUserData);
      
      // Filter out undefined values before saving to Firestore
      const userDataForFirestore = Object.fromEntries(
        Object.entries(newUserData).filter(([_, value]) => value !== undefined)
      );
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userDataForFirestore,
        createdAt: newUserData.createdAt.toISOString() // Convert Date to string for Firestore
      });
      
      console.log('User registered successfully:', user.uid);
      console.log('Setting user data:', newUserData);
      setUserData(newUserData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const mapAuthError = (code?: string): string => {
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/missing-password': return 'Password is required.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      case 'auth/operation-not-allowed': return 'Email/password sign-in is disabled in Firebase Auth settings.';
      default: return 'Login failed. Please check your credentials and try again.';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();
      const res = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);

      const userRef = doc(db, 'users', res.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, { email: res.user.email || normalizedEmail, createdAt: new Date().toISOString() }, { merge: true });
      }
      await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });

      // If this is an admin email, enforce auto-approval and role immediately
      if (res.user.email && ADMIN_EMAILS.includes(res.user.email.toLowerCase())) {
        await ensureAdminPrivileges(res.user);
        await refreshUserData();
      }
    } catch (e: any) {
      const code = e?.code as string | undefined;
      const message = mapAuthError(code);
      console.error('Login error:', code, e);
      throw new Error(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const approveUser = async (userId: string) => {
    try {
      console.log('Approving user:', userId);
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        approvedAt: new Date(),
        status: 'approved'
      });
      console.log('User approved successfully:', userId);
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      console.log('Rejecting user:', userId);
      await updateDoc(doc(db, 'users', userId), {
        approved: false,
        rejectedAt: new Date(),
        status: 'rejected'
      });
      console.log('User rejected successfully:', userId);
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  };

  const getPendingUsers = async (): Promise<User[]> => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      // First, let's get ALL users to see what's actually in the database
      const usersRef = collection(db, 'users');
      const allUsersSnapshot = await getDocs(usersRef);
      
      console.log('🔍 DEBUGGING: Found total users in database:', allUsersSnapshot.docs.length);
      console.log('🔍 DEBUGGING: All users data:', allUsersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        data: doc.data(),
        approved: (doc.data() as any).approved,
        status: (doc.data() as any).status,
        role: (doc.data() as any).role,
        email: (doc.data() as any).email,
        name: (doc.data() as any).name
      })));
      
      // Show detailed structure of each user
      allUsersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data() as any;
        console.log(`🔍 DEBUGGING: User ${index + 1} detailed structure:`, {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          approved: data.approved,
          status: data.status,
          createdAt: data.createdAt,
          allFields: Object.keys(data),
          rawData: data
        });
      });
      
      // Now try different queries to find pending users
      const queries = [
        // Query 1: approved = false
        query(usersRef, where('approved', '==', false)),
        // Query 2: status = 'pending'
        query(usersRef, where('status', '==', 'pending')),
        // Query 3: approved = false AND status = 'pending'
        query(usersRef, where('approved', '==', false), where('status', '==', 'pending')),
        // Query 4: approved exists and is false
        query(usersRef, where('approved', '==', false))
      ];
      
      let pendingUsers: User[] = [];
      
      for (let i = 0; i < queries.length; i++) {
        try {
          const snapshot = await getDocs(queries[i]);
          console.log(`🔍 DEBUGGING: Query ${i + 1} found ${snapshot.docs.length} users`);
          
          if (snapshot.docs.length > 0) {
            console.log(`🔍 DEBUGGING: Query ${i + 1} results:`, snapshot.docs.map(doc => ({ 
              id: doc.id, 
              data: doc.data() 
            })));
            
            const users = snapshot.docs.map(doc => {
              const data = doc.data() as any;
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt)) : new Date(),
                lastLogin: data.lastLogin ? (data.lastLogin instanceof Date ? data.lastLogin : new Date(data.lastLogin)) : undefined
              } as User;
            });
            
            pendingUsers = users;
            break; // Use the first query that returns results
          }
        } catch (queryError) {
          console.log(`🔍 DEBUGGING: Query ${i + 1} failed:`, queryError);
        }
      }
      
      // If no specific query worked, try to find users that look like they need approval
      if (pendingUsers.length === 0) {
        console.log('🔍 DEBUGGING: No users found with standard queries, checking all users for pending status...');
        
        const allUsers = allUsersSnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt)) : new Date(),
            lastLogin: data.lastLogin ? (data.lastLogin instanceof Date ? data.lastLogin : new Date(data.lastLogin)) : undefined
          } as User;
        });
        
        // Filter for users that might be pending
        pendingUsers = allUsers.filter(user => {
          const isPending = 
            (user as any).approved === false || 
            (user as any).status === 'pending' || 
            !(user as any).approved ||
            ((user as any).role !== 'admin' && !(user as any).approved) ||
            (user as any).approved === undefined ||
            (user as any).approved === null;
          return isPending;
        });
      }
      
      console.log('✅ Final pending users found:', pendingUsers.length);
      return pendingUsers;
    } catch (error) {
      console.error('❌ Error fetching pending users from database:', error);
      return [];
    }
  };


  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      console.log('Found total users:', snapshot.docs.length);
      
      const users = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined
        } as User;
      });
      
      console.log('All users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  // Debug function to check database contents
  const debugDatabase = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      console.log('🔍 DEBUGGING: Checking all collections in database...');
      
      // Check users collection
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      console.log('🔍 DEBUGGING: Users collection:');
      console.log(`- Total documents: ${usersSnapshot.docs.length}`);
      
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`- User ${index + 1}:`, {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          approved: data.approved,
          status: data.status,
          createdAt: data.createdAt,
          allFields: Object.keys(data)
        });
      });
      
      return {
        totalUsers: usersSnapshot.docs.length,
        users: usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      };
    } catch (error) {
      console.error('❌ Error debugging database:', error);
      return null;
    }
  };

  // Function to create test pending users
  const createTestPendingUsers = async () => {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      
      const testUsers = [
        {
          email: 'pending1@example.com',
          name: 'Pending User 1',
          role: 'inspector',
          approved: false,
          status: 'pending',
          createdAt: new Date(),
          department: 'Quality Control',
          phone: '+91 98765 43210',
          location: 'Mumbai Central',
          experience: '5 years',
          qualifications: 'B.Tech Mechanical Engineering',
          reason: 'Requesting access to inspect railway parts and components'
        },
        {
          email: 'pending2@example.com',
          name: 'Pending User 2',
          role: 'vendor',
          approved: false,
          status: 'pending',
          createdAt: new Date(),
          department: 'Parts Supply',
          phone: '+91 87654 32109',
          location: 'Delhi Junction',
          experience: '3 years',
          qualifications: 'MBA in Supply Chain',
          reason: 'Need access for parts supply management'
        },
        {
          email: 'pending3@example.com',
          name: 'Pending User 3',
          role: 'engineer',
          approved: false,
          status: 'pending',
          createdAt: new Date(),
          department: 'Installation',
          phone: '+91 76543 21098',
          location: 'Chennai Central',
          experience: '8 years',
          qualifications: 'B.Tech Civil Engineering',
          reason: 'Requesting access for railway installation work'
        }
      ];

      console.log('🔍 DEBUGGING: Creating test pending users...');
      
      for (const user of testUsers) {
        // Filter out undefined values before saving to Firestore
        const userDataForFirestore = Object.fromEntries(
          Object.entries(user).filter(([_, value]) => value !== undefined)
        );
        
        await addDoc(collection(db, 'users'), {
          ...userDataForFirestore,
          createdAt: user.createdAt.toISOString()
        });
      }
      
      console.log('✅ Test pending users created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating test users:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Enforce admin privileges on session change if needed
        await ensureAdminPrivileges(user);
        await refreshUserData();
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [ensureAdminPrivileges, refreshUserData]);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    refreshUserData,
    approveUser,
    rejectUser,
    getPendingUsers,
    getAllUsers,
    debugDatabase,
    createTestPendingUsers,
    isAdminEmail: (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase())
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}