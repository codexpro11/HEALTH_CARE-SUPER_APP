import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

export const googleProvider = new GoogleAuthProvider();

// Lazy initialization lets the standalone demo run without Firebase credentials.
export function getFirebaseAuth() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId || apiKey === 'YOUR_FIREBASE_API_KEY') {
    throw new Error('Sign-in is not configured. Provide Firebase environment values or enable demo mode.');
  }
  const app = getApps().length ? getApp() : initializeApp({
    apiKey, projectId,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  return getAuth(app);
}
