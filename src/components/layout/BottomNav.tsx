'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Search, Sparkles, Crown, User, LogIn, LayoutDashboard } from 'lucide-react';
import { onFirebaseAuthState } from '@/lib/firebase/authService';

export function BottomNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    authenticated: boolean;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onFirebaseAuthState((user, loading) => {
      if (loading) return;
      if (user) {
        setCurrentUser({ authenticated: true, role: user.role });
      } else {
        setCurrentUser({ authenticated: false });
      }
    });
    return () => unsubscribe();
  }, []);

  const isHomeActive = pathname === '/';
  const isSearchActive = pathname?.startsWith('/search');
  const isPlanActive = pathname?.startsWith('/membership-plan');
  const isAccountActive =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login');
  const isRegisterActive = pathname?.startsWith('/register') || pathname?.startsWith('/biodata');

  const centerHref = currentUser?.authenticated ? '/biodata' : '/register';
  const centerLabel = currentUser?.authenticated ? 'Biodata' : 'Join Free';

  const accountHref = currentUser?.authenticated
    ? currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'
      ? '/admin'
      : '/dashboard'
    : '/login?redirect=/dashboard';

  const accountLabel = currentUser?.authenticated
    ? currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'
      ? 'Admin'
      : 'Dashboard'
    : 'Sign In';

  return (
    <nav className="luxury-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="luxury-bottom-nav__container">
        {/* 1. Home */}
        <Link
          href="/"
          className={`luxury-bottom-nav__item ${isHomeActive ? 'is-active' : ''}`}
        >
          <div className="luxury-bottom-nav__icon-box">
            <Home size={20} />
            {isHomeActive && <span className="luxury-bottom-nav__indicator" />}
          </div>
          <span className="luxury-bottom-nav__label">Home</span>
        </Link>

        {/* 2. Search */}
        <Link
          href="/search"
          className={`luxury-bottom-nav__item ${isSearchActive ? 'is-active' : ''}`}
        >
          <div className="luxury-bottom-nav__icon-box">
            <Search size={20} />
            {isSearchActive && <span className="luxury-bottom-nav__indicator" />}
          </div>
          <span className="luxury-bottom-nav__label">Search</span>
        </Link>

        {/* 3. CENTER HIGHLIGHTED ACTION PILL (FAB) */}
        <Link
          href={centerHref}
          className={`luxury-bottom-nav__fab-item ${isRegisterActive ? 'is-active' : ''}`}
          aria-label={centerLabel}
        >
          <div className="luxury-bottom-nav__fab-circle">
            <Sparkles size={21} className="luxury-bottom-nav__fab-icon" />
          </div>
          <span className="luxury-bottom-nav__fab-label">{centerLabel}</span>
        </Link>

        {/* 4. Membership Plans */}
        <Link
          href="/membership-plan"
          className={`luxury-bottom-nav__item ${isPlanActive ? 'is-active' : ''}`}
        >
          <div className="luxury-bottom-nav__icon-box">
            <Crown size={20} />
            {isPlanActive && <span className="luxury-bottom-nav__indicator" />}
          </div>
          <span className="luxury-bottom-nav__label">Plans</span>
        </Link>

        {/* 5. Account / Dashboard / Login */}
        <Link
          href={accountHref}
          className={`luxury-bottom-nav__item ${isAccountActive ? 'is-active' : ''}`}
        >
          <div className="luxury-bottom-nav__icon-box">
            {currentUser?.authenticated ? (
              currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? (
                <Crown size={20} style={{ color: '#F59E0B' }} />
              ) : (
                <LayoutDashboard size={20} />
              )
            ) : (
              <LogIn size={20} />
            )}
            {isAccountActive && <span className="luxury-bottom-nav__indicator" />}
          </div>
          <span className="luxury-bottom-nav__label">{accountLabel}</span>
        </Link>
      </div>
    </nav>
  );
}
