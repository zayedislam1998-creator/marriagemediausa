import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEUBc0XfAp3fHc3_gOP9FTMNobDrgIu2E",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "muslimbibahmodern.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "muslimbibahmodern",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "muslimbibahmodern.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "258748491580",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:258748491580:web:74b50cae0d4261d6512039",
};

// Singleton initialization pattern to prevent multiple app instances during HMR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
