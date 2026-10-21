'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const [authError, setAuthError] = useState<string | null>(null);
  const hasRedirectedRef = useRef<boolean>(false);
  const authResolvedRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    authResolvedRef.current = false;

    // Stop showing the spinner if the API is slow, but do not treat a timeout as
    // proof that the session is invalid. The API response remains authoritative.
    const safetyTimer = setTimeout(() => {
      if (!isCancelled && !authResolvedRef.current) {
        setIsLoading(false);
      }
    }, 3500);

    const checkAuthentication = async () => {
      try {
        // 1. Authoritative check: PostgreSQL HTTP-Only session (/api/auth/me)
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.status >= 500) {
          if (!isCancelled) {
            authResolvedRef.current = true;
            setAuthError('We could not verify your session right now. Please retry in a moment.');
            setIsLoading(false);
          }
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (!isCancelled) {
              authResolvedRef.current = true;
              setAuthError(null);
              const mappedUser: FirestoreUser = {
                uid: data.user.userId,
                email: data.user.email,
                fullName: data.user.fullName || 'Distinguished Member',
                role: data.user.role || 'MEMBER',
                membershipTier: data.user.tier || 'FREE',
                status: 'ACTIVE',
                profileId: data.user.profileId || `MMU_${data.user.userId.slice(-6)}`,
                dailyViewLimit: Number(data.user.dailyViewLimit) || 15,
                contactCredits: Number(data.user.contactCredits) || 0,
              };

              const isAdminUser = mappedUser.role === 'SUPER_ADMIN';

              if (options?.requireRole === 'ADMIN' && !isAdminUser) {
                setUser(mappedUser);
                setIsUnauthorizedRole(true);
                setIsLoading(false);
                return;
              }

              setUser(mappedUser);
              setIsUnauthorizedRole(false);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('[Auth] Session check warning:', err);
        if (!isCancelled) {
          authResolvedRef.current = true;
          setAuthError('We could not connect to verify your session. Please retry in a moment.');
          setIsLoading(false);
        }
        return;
      }

      // If not authenticated via server session
      if (!isCancelled) {
        authResolvedRef.current = true;
        setAuthError(null);
        setUser(null);
        setIsLoading(false);

        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          const target = pathname || '/dashboard';
          const redirectUrl = `/login?redirect=${encodeURIComponent(target)}`;
          router.push(redirectUrl);
        }
      }
    };

    checkAuthentication();

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [router, pathname, options?.requireRole]);

  const isAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    await executeUniversalLogout('/login?logged_out=1');
  };

  return {
    user,
    isLoading,
    isUnauthorizedRole,
    authError,
    isAdmin,
    logout: handleLogout,
  };
}
