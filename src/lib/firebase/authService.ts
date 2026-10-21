import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { FirestoreUser, getFirestoreUser, updateFirestoreUserRoleAndTier } from './firestoreService';

export interface AuthResponse {
  success: boolean;
  user?: FirestoreUser;
  error?: string;
}

/**
 * Register a new member with Firebase Authentication and Firestore document.
 */
export async function firebaseRegister(
  email: string,
  pass: string,
  fullName: string,
  gender: 'MALE' | 'FEMALE' = 'FEMALE'
): Promise<AuthResponse> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = cred.user;

    await updateProfile(fbUser, { displayName: fullName });

    const userDocRef = doc(db, 'users', fbUser.uid);
    const profileId = `${gender === 'FEMALE' ? 'BR' : 'GR'}_${Date.now().toString().slice(-6)}`;

    const userData: FirestoreUser = {
      uid: fbUser.uid,
      email: fbUser.email || email,
      fullName,
      role: 'MEMBER',
      membershipTier: 'FREE',
      status: 'ACTIVE',
      gender,
      profileId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, userData);

    return {
      success: true,
      user: userData,
    };
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    let errorMsg = error.message || 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters.';
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign in an existing user and retrieve their Firestore profile and permissions.
 */
export async function firebaseLogin(email: string, pass: string): Promise<AuthResponse> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const fbUser = cred.user;

    let userProfile = await getFirestoreUser(fbUser.uid);

    // If profile document doesn't exist yet, auto-provision
    if (!userProfile) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      userProfile = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        fullName: fbUser.displayName || 'Member',
        role: 'MEMBER',
        membershipTier: 'FREE',
        status: 'ACTIVE',
        profileId: `MB_${Date.now().toString().slice(-6)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, userProfile);
    }

    if (userProfile.status === 'SUSPENDED') {
      await signOut(auth);
      return { success: false, error: 'Your account has been suspended by administration.' };
    }

    return {
      success: true,
      user: userProfile,
    };
  } catch (error: any) {
    console.error('Firebase login error:', error);
    let errorMsg = 'Invalid email or password.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMsg = 'Invalid credentials. Please verify your email and password.';
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign out current user.
 */
export async function firebaseLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase logout error:', error);
  }
}

/**
 * Listen to Firebase Auth state changes with Firestore profile lookup.
 */
export function onFirebaseAuthState(
  callback: (user: FirestoreUser | null, loading: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null, false);
      return;
    }

    try {
      const profile = await getFirestoreUser(fbUser.uid);
      callback(profile, false);
    } catch {
      callback(null, false);
    }
  });
}

/**
 * Admin action to grant tier or change role (e.g. Gold, Bronze, Silver, Diamond access).
 */
export async function adminSetMemberAccess(
  targetUid: string,
  membershipTier: FirestoreUser['membershipTier'],
  role?: FirestoreUser['role']
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Partial<FirestoreUser> = { membershipTier };
    if (role) updates.role = role;

    return await updateFirestoreUserRoleAndTier(targetUid, updates);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
