import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface FirestorePackage {
  id: string;
  name: string;
  priceUsd: number;
  durationMonths: number;
  contactCredits: number;
  dailyProfileViewLimit: number;
  badgeTitle: string;
  features: string[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreUser {
  uid: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | 'MODERATOR';
  membershipTier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'PLATINUM' | 'ELITE';
  status: 'ACTIVE' | 'SUSPENDED';
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  profileId?: string;
  dailyViewLimit?: number;
  contactCredits?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreFormConfig {
  formId: string;
  title: string;
  theme: string;
  borderRadius: string;
  buttonText: string;
  fields: any[];
  updatedAt?: any;
}

// ============================================================
// 1. PACKAGES MANAGEMENT (Firestore Live)
// ============================================================

export async function getFirestorePackages(): Promise<FirestorePackage[]> {
  try {
    const packagesRef = collection(db, 'packages');
    const q = query(packagesRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const packages: FirestorePackage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      packages.push({
        id: docSnap.id,
        name: data.name || '',
        priceUsd: Number(data.priceUsd || 0),
        durationMonths: Number(data.durationMonths || 1),
        contactCredits: Number(data.contactCredits || 0),
        dailyProfileViewLimit: Number(data.dailyProfileViewLimit || 10),
        badgeTitle: data.badgeTitle || 'Member',
        features: Array.isArray(data.features) ? data.features : [],
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return packages.sort((a, b) => a.priceUsd - b.priceUsd);
  } catch (error) {
    console.error('Error fetching packages from Firestore:', error);
    return [];
  }
}

export async function saveFirestorePackage(pkg: Omit<FirestorePackage, 'id'> & { id?: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const packageId = pkg.id || `pkg_${Date.now()}`;
    const docRef = doc(db, 'packages', packageId);

    const payload = {
      name: pkg.name,
      priceUsd: Number(pkg.priceUsd),
      durationMonths: Number(pkg.durationMonths),
      contactCredits: Number(pkg.contactCredits),
      dailyProfileViewLimit: Number(pkg.dailyProfileViewLimit),
      badgeTitle: pkg.badgeTitle,
      features: pkg.features,
      isActive: pkg.isActive,
      updatedAt: serverTimestamp(),
      ...(pkg.id ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(docRef, payload, { merge: true });
    return { success: true, id: packageId };
  } catch (error: any) {
    console.error('Error saving package to Firestore:', error);
    return { success: false, error: error.message || 'Failed to save package' };
  }
}

export async function toggleFirestorePackage(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'packages', id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling package status in Firestore:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFirestorePackage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'packages', id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting package from Firestore:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 2. USERS & RBAC GOVERNANCE (Firestore Live)
// ============================================================

export async function getFirestoreUsers(): Promise<FirestoreUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users: FirestoreUser[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        email: data.email || '',
        fullName: data.fullName || data.name || '',
        role: data.role || 'MEMBER',
        membershipTier: data.membershipTier || 'FREE',
        status: data.status || 'ACTIVE',
        phone: data.phone || '',
        gender: data.gender,
        profileId: data.profileId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching users from Firestore:', error);
    return [];
  }
}

export async function getFirestoreUser(uid: string): Promise<FirestoreUser | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      uid: snapshot.id,
      email: data.email || '',
      fullName: data.fullName || data.name || '',
      role: data.role || 'MEMBER',
      membershipTier: data.membershipTier || 'FREE',
      status: data.status || 'ACTIVE',
      phone: data.phone || '',
      gender: data.gender,
      profileId: data.profileId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
}

export async function updateFirestoreUserRoleAndTier(
  uid: string,
  updates: Partial<Pick<FirestoreUser, 'role' | 'membershipTier' | 'status'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role/tier in Firestore:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 3. FORM STUDIO CONFIGS (Firestore Live)
// ============================================================

export async function getFirestoreFormConfigs(): Promise<FirestoreFormConfig[]> {
  try {
    const configsRef = collection(db, 'form_builder_configs');
    const snapshot = await getDocs(configsRef);

    const configs: FirestoreFormConfig[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      configs.push({
        formId: docSnap.id,
        title: data.title || '',
        theme: data.theme || 'emerald',
        borderRadius: data.borderRadius || '12px',
        buttonText: data.buttonText || 'Save',
        fields: Array.isArray(data.fields) ? data.fields : [],
        updatedAt: data.updatedAt,
      });
    });

    return configs;
  } catch (error) {
    console.error('Error fetching form configs from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreFormConfig(
  formId: string,
  config: Omit<FirestoreFormConfig, 'formId'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'form_builder_configs', formId);
    await setDoc(
      docRef,
      {
        ...config,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error saving form config in Firestore:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 4. DEFAULT SEEDING FUNCTION FOR FIRESTORE
// ============================================================

export async function seedFirestoreInitialData(): Promise<{ success: boolean; count: number }> {
  try {
    // Check if packages exist
    const currentPackages = await getFirestorePackages();
    if (currentPackages.length === 0) {
      const defaultPackages = [
        {
          id: 'pkg_free',
          name: 'Free Trial',
          priceUsd: 0,
          durationMonths: 1,
          contactCredits: 5,
          dailyProfileViewLimit: 10,
          badgeTitle: 'Free Member',
          features: [
            'Basic Biodata Creation',
            '5 Contact Unlocks',
            'Purdah Photo Privacy',
            '10 Daily Profile Views',
          ],
          isActive: true,
        },
        {
          id: 'pkg_silver',
          name: 'Silver Sunnah Plan',
          priceUsd: 2000,
          durationMonths: 2,
          contactCredits: 25,
          dailyProfileViewLimit: 50,
          badgeTitle: 'Silver Member',
          features: [
            '25 Verified Contact Unlocks',
            'Direct Wali Guardian Phone Visibility',
            'Purdah Privacy Shield',
            '50 Profile Views Daily',
          ],
          isActive: true,
        },
        {
          id: 'pkg_gold',
          name: 'Gold Barakah Plan',
          priceUsd: 3000,
          durationMonths: 3,
          contactCredits: 50,
          dailyProfileViewLimit: 100,
          badgeTitle: 'Gold Member',
          features: [
            '50 Verified Contact Unlocks',
            'Direct Wali Phone Numbers',
            'Halal Chat Lounge Direct Messaging',
            'Featured Biodata Placement',
          ],
          isActive: true,
        },
        {
          id: 'pkg_diamond',
          name: 'Diamond VIP Plan',
          priceUsd: 4000,
          durationMonths: 6,
          contactCredits: 100,
          dailyProfileViewLimit: 250,
          badgeTitle: 'Diamond VIP',
          features: [
            '100 Verified Contact Unlocks',
            'Priority KYC Verification Badge',
            'Unlimited Daily Profile Views',
            'Direct Matchmaker Advice',
          ],
          isActive: true,
        },
        {
          id: 'pkg_elite',
          name: 'Royal Walima Concierge',
          priceUsd: 6500,
          durationMonths: 12,
          contactCredits: 999,
          dailyProfileViewLimit: 999,
          badgeTitle: 'Elite Concierge',
          features: [
            'Full 1-Year Executive Matchmaking',
            'Personal Halal Family Consultant',
            'Family Wali Background Check',
            'Dedicated Wedding Services Coordination',
          ],
          isActive: true,
        },
      ];

      for (const p of defaultPackages) {
        await saveFirestorePackage(p);
      }
    }

    return { success: true, count: 5 };
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
    return { success: false, count: 0 };
  }
}
