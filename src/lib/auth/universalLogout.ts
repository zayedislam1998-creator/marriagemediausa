'use client';

import { firebaseLogout } from '@/lib/firebase/authService';

/**
 * Universal logout handler for MuslimBibah.com.
 *
 * Atomically clears:
 * 1. PostgreSQL HTTP-Only session cookie (`mb_session`) via POST /api/auth/logout.
 * 2. Firebase Client SDK session (IndexedDB / LocalStorage auth tokens).
 * 3. Client browser storage (localStorage / sessionStorage auth caches).
 * 4. Cross-tab synchronization via BroadcastChannel.
 * 5. Performs a clean, hard navigation to /login?logged_out=1.
 */
export async function executeUniversalLogout(redirectUrl: string = '/login?logged_out=1'): Promise<void> {
  try {
    // 1. Invalidate server-side HTTP-Only session cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch (err) {
    console.warn('[Logout] Server session clearance error:', err);
  }

  try {
    // 2. Sign out of Firebase Auth client SDK
    await firebaseLogout();
  } catch (err) {
    console.warn('[Logout] Firebase sign out error:', err);
  }

  try {
    // 3. Clear sensitive local & session storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('firebase:authUser') ||
            key.startsWith('mb_') ||
            key.includes('token') ||
            key.includes('session'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn('[Logout] Storage clearance error:', err);
  }

  try {
    // 4. Notify any other open tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mb_auth_sync');
      channel.postMessage({ type: 'LOGOUT', timestamp: Date.now() });
      channel.close();
    }
  } catch {}

  // 5. Force hard redirect to guarantee fresh state and avoid stale cache
  if (typeof window !== 'undefined') {
    window.location.href = redirectUrl;
  }
}
