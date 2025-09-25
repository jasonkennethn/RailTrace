import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  division: string;
  section: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo users for authentication when Firebase is not configured
  const demoUsers = [
    { email: 'admin@railway.gov.in', password: 'admin123', name: 'Administrator', role: 'admin' as const },
    { email: 'drm@railway.gov.in', password: 'drm123', name: 'DRM User', role: 'drm' as const },
    { email: 'srden@railway.gov.in', password: 'srden123', name: 'Sr. DEN User', role: 'sr_den' as const },
    { email: 'den@railway.gov.in', password: 'den123', name: 'DEN User', role: 'den' as const },
    { email: 'inspector@railway.gov.in', password: 'inspector123', name: 'Field Inspector', role: 'inspector' as const },
    { email: 'manufacturer@railway.gov.in', password: 'mfg123', name: 'Manufacturer User', role: 'manufacturer' as const },
  ];

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      // Try to use Firebase auth if available
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData.name || 'User',
                role: userData.role || 'inspector',
                division: userData.division,
                section: userData.section,
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastLogin: new Date()
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          // Check for stored demo user session
          const storedUser = localStorage.getItem('railway_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Error parsing stored user:', error);
              localStorage.removeItem('railway_user');
            }
          }
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Firebase auth not available, using demo mode:', error);
      // Fallback to demo mode
      const storedUser = localStorage.getItem('railway_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('railway_user');
        }
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try Firebase auth first
      if (auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Get or create user document in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          // Create new user document
          const demoUser = demoUsers.find(u => u.email === email);
          const userData = {
            name: demoUser?.name || 'User',
            role: demoUser?.role || 'inspector',
            email: email,
            createdAt: new Date(),
            lastLogin: new Date()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }
      } else {
        throw new Error('Firebase auth not available');
      }
    } catch (error) {
      console.log('Firebase auth failed, using demo mode:', error);
      
      // Fallback to demo authentication
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        const user: User = {
          id: `demo_${demoUser.role}`,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        setUser(user);
        localStorage.setItem('railway_user', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      // Try Firebase auth first
      if (auth && db) {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;
        
        // Create user document in Firestore
        const userData = {
          name: data.name,
          role: data.role,
          email: data.email,
          division: data.division,
          section: data.section,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        throw new Error('Firebase auth not available');
      }
    } catch (error) {
      console.log('Firebase signup failed, using demo mode:', error);
      
      // Fallback to demo registration
      const user: User = {
        id: `demo_${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        division: data.division,
        section: data.section,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      setUser(user);
      localStorage.setItem('railway_user', JSON.stringify(user));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('railway_user');
    }
  };

  const value = {
    user,
    loading,
    login,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};