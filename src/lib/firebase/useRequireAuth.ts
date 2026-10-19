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
  const hasRedirectedRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    // Safety fallback timeout: under NO circumstances will loading spinner stay stuck > 3.5s
    const safetyTimer = setTimeout(() => {
      if (!isCancelled && isLoading) {
        setIsLoading(false);
        if (!user && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          const target = pathname || '/dashboard';
          router.push(`/login?redirect=${encodeURIComponent(target)}`);
        }
      }
    }, 3500);

    const checkAuthentication = async () => {
      try {
        // 1. Authoritative check: PostgreSQL HTTP-Only session (/api/auth/me)
        const res = await fetch('/api/auth/me');
        if (res.ok) {
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

              const isAdminUser =
                mappedUser.role === 'SUPER_ADMIN' ||
                mappedUser.role === 'ADMIN' ||
                (mappedUser.email && (
                  mappedUser.email.toLowerCase() === 'skyxamerica24@gmail.com' ||
                  mappedUser.email.toLowerCase().includes('admin')
                ));

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
      }

      // If not authenticated via server session
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
    };

    checkAuthentication();

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
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
