'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onFirebaseAuthState, firebaseLogout } from '@/lib/firebase/authService';
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

  useEffect(() => {
    const unsubscribe = onFirebaseAuthState(async (authUser, loading) => {
      if (loading) return;

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        const target = pathname || '/dashboard';
        const redirectUrl = `/login?redirect=${encodeURIComponent(target)}`;
        router.push(redirectUrl);
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
        // The user is authenticated as regular member, but admin role is required
        setUser(authUser);
        setIsUnauthorizedRole(true);
        setIsLoading(false);
        return;
      }

      setUser(authUser);
      setIsUnauthorizedRole(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
    await firebaseLogout();
    router.push('/login');
  };

  return {
    user,
    isLoading,
    isUnauthorizedRole,
    isAdmin,
    logout: handleLogout,
  };
}
