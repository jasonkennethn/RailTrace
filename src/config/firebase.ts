// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUPsx5jXbdrP7t1O9uqwVYeLIzhxHPsxU",
  authDomain: "rialconnect-1881f.firebaseapp.com",
  projectId: "rialconnect-1881f",
  storageBucket: "rialconnect-1881f.firebasestorage.app",
  messagingSenderId: "1067040998361",
  appId: "1:1067040998361:web:6245ce5f660887ff52cfc8",
  measurementId: "G-TNZTM7M3PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
declare global {
  interface Window { __FIRESTORE_INITIALIZED__?: boolean }
}

export const db = (() => {
  if (typeof window !== 'undefined') {
    if (!window.__FIRESTORE_INITIALIZED__) {
      const instance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        // experimentalForceLongPolling: true,
      });
      window.__FIRESTORE_INITIALIZED__ = true;
      return instance;
    }
    return getFirestore(app);
  }
  // SSR or non-window environment fallback
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
})();
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;