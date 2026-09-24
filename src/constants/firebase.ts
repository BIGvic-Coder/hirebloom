import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase Config (using Expo environment variables with real project fallbacks)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsLggzQ0z6qrOprKYZvKguKoT8Fr6ofTE",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "hirebloom-eca13.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "hirebloom-eca13",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "hirebloom-eca13.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "32893466508",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:32893466508:web:732172cab258480f91b162"
};

// Check if Firebase is initialized, otherwise initialize it
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence (vital for React Native)
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  // Graceful fallback for web/other environments where initializeAuth might already be set
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

let authSyncPromise: Promise<any> | null = null;

/**
 * Ensures the app has an active authenticated Firebase session so Firestore
 * security rules permit real-time cloud synchronization of applications between iOS and Android.
 */
export async function ensureFirebaseAuth(): Promise<any> {
  if (IS_MOCK_FIREBASE || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  if (authSyncPromise) return authSyncPromise;

  authSyncPromise = (async () => {
    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      try {
        const cred = await signInWithEmailAndPassword(auth, 'sync.system@hirebloom.com', 'HireBloom2026!Secure');
        return cred.user;
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          const cred = await createUserWithEmailAndPassword(auth, 'sync.system@hirebloom.com', 'HireBloom2026!Secure');
          return cred.user;
        }
        return null;
      }
    } catch {
      return null;
    } finally {
      authSyncPromise = null;
    }
  })();

  return authSyncPromise;
}

// Proactively connect to Firebase Auth in background
try {
  ensureFirebaseAuth().catch(() => {});
} catch {}

export { app, auth, db };
export const IS_MOCK_FIREBASE = firebaseConfig.apiKey === "mock-api-key";

/**
 * Recursively strips any undefined fields from objects before saving to Firestore,
 * preventing Firestore's "Unsupported field value: undefined" runtime error.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}


