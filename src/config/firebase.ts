import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBUPsx5jXbdrP7t1O9uqwVYeLIzhxHPsxU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rialconnect-1881f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rialconnect-1881f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rialconnect-1881f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1067040998361",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1067040998361:web:6245ce5f660887ff52cfc8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TNZTM7M3PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;