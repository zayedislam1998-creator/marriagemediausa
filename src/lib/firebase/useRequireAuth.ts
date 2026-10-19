'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onFirebaseAuthState } from '@/lib/firebase/authService';
import { executeUniversalLogout } from '@/lib/auth/universalLogout';
import { FirestoreUser } from '@/lib/firebase/firestoreService';

export interface UseRequireAuthOptions {
  requireRole?: 'ADMIN' | 'MEMBER';
}

export function useRequireAuth(options?: UseRequireAuthOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorizedRole, setIsUnauthorizedRole] = useState<boolean>(false);
  const hasRedirectedRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const checkServerSessionFallback = async (): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return false;
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (!isCancelled) {
            const mappedUser: FirestoreUser = {
              uid: data.user.userId,
              email: data.user.email,
              fullName: data.user.fullName || 'Distinguished Member',
              role: data.user.role || 'MEMBER',
              membershipTier: data.user.tier || 'GOLD',
              status: 'ACTIVE',
              profileId: data.user.profileId || `MMU_${data.user.userId.slice(-6)}`,
            };

            const isAdmin =
              mappedUser.role === 'SUPER_ADMIN' ||
              mappedUser.role === 'ADMIN' ||
              (mappedUser.email && (
                mappedUser.email.toLowerCase() === 'skyxamerica24@gmail.com' ||
                mappedUser.email.toLowerCase().includes('admin')
              ));

            if (options?.requireRole === 'ADMIN' && !isAdmin) {
              setUser(mappedUser);
              setIsUnauthorizedRole(true);
              setIsLoading(false);
              return true;
            }

            setUser(mappedUser);
            setIsUnauthorizedRole(false);
            setIsLoading(false);
          }
          return true;
        }
      } catch (err) {
        console.warn('[Auth] Server session fallback check error:', err);
      }
      return false;
    };

    const unsubscribe = onFirebaseAuthState(async (authUser, loading) => {
      if (loading) return;

      if (!authUser) {
        // Check if there is an active PostgreSQL server session (mb_session cookie)
        const hasServerSession = await checkServerSessionFallback();
        if (hasServerSession) return;

        if (!isCancelled) {
          setUser(null);
          setIsLoading(false);

          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            const target = pathname || '/dashboard';
            const redirectUrl = `/login?redirect=${encodeURIComponent(target)}`;
            router.push(redirectUrl);
          }
        }
        return;
      }

      const isAdmin =
        authUser.role === 'SUPER_ADMIN' ||
        authUser.role === 'ADMIN' ||
        (authUser.email && (
          authUser.email.toLowerCase() === 'skyxamerica24@gmail.com' ||
          authUser.email.toLowerCase().includes('admin')
        ));

      if (options?.requireRole === 'ADMIN' && !isAdmin) {
        if (!isCancelled) {
          setUser(authUser);
          setIsUnauthorizedRole(true);
          setIsLoading(false);
        }
        return;
      }

      if (!isCancelled) {
        setUser(authUser);
        setIsUnauthorizedRole(false);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [router, pathname, options?.requireRole]);

  const isAdmin = user
    ? user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN' ||
      (user.email && (
        user.email.toLowerCase() === 'skyxamerica24@gmail.com' ||
        user.email.toLowerCase().includes('admin')
      ))
    : false;

  const handleLogout = async () => {
    await executeUniversalLogout('/login?logged_out=1');
  };

  return {
    user,
    isLoading,
    isUnauthorizedRole,
    isAdmin,
    logout: handleLogout,
  };
}
