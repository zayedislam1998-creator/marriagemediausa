'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  BookOpen,
  Building,
  Utensils,
  Camera,
  Flower2,
  Info,
  Lock,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Crown,
  LogOut,
} from 'lucide-react';

import { onFirebaseAuthState, firebaseLogout } from '@/lib/firebase/authService';

export function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    authenticated: boolean;
    user?: {
      userId: string;
      email: string;
      fullName: string;
      role: string;
      tier: string;
    };
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onFirebaseAuthState((user, loading) => {
      if (loading) return;
      if (user) {
        setCurrentUser({
          authenticated: true,
          user: {
            userId: user.uid,
            email: user.email,
            fullName: user.fullName || user.email,
            role: user.role,
            tier: user.membershipTier,
          },
        });
      } else {
        setCurrentUser({ authenticated: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      setCurrentUser({ authenticated: false });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        className="app-header"
        style={{
          height: isScrolled ? 64 : 72,
          background: isScrolled
            ? 'rgba(255, 255, 255, 0.97)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.96) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '2px solid rgba(5, 150, 105, 0.2)',
          boxShadow: isScrolled
            ? '0 14px 32px -10px rgba(15, 23, 42, 0.16), 0 2px 0 0 #059669'
            : '0 8px 24px -10px rgba(15, 23, 42, 0.1), 0 2px 0 0 rgba(5, 150, 105, 0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 500,
          paddingInline: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ============================================================
            1. MOBILE LEFT HAMBURGER BUTTON (< 768px)
           ============================================================ */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open Navigation Menu"
          className="app-header__mobile-hamburger"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            border: '1.5px solid #cbd5e1',
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 2px 0 #94a3b8, 0 3px 6px rgba(15, 23, 42, 0.08)',
            flexShrink: 0,
            marginRight: 6,
          }}
        >
          <Menu size={20} style={{ color: '#059669' }} />
        </button>

        {/* ============================================================
            2. BRAND LOGO (OFFICIAL CRISP DISPLAY)
           ============================================================ */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            className="brand-logo-badge"
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #043d2e 45%, #022c22 100%)',
              padding: '5px 14px',
              borderRadius: 12,
              border: '1.5px solid rgba(52, 211, 153, 0.45)',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease',
            }}
          >
            <img
              src="/logo.png"
              alt="Marriage Media USA - Worldwide Halal Matrimony"
              style={{
                height: isScrolled ? 34 : 40,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                transition: 'height 0.2s ease',
              }}
            />
          </div>
        </Link>

        {/* ============================================================
            3. DESKTOP MAIN NAVIGATION (>= 768px ONLY)
           ============================================================ */}
        <nav
          className="app-header__nav app-header__desktop-nav"
          aria-label="Main Navigation"
          style={{
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* 1. Home */}
          <Link
            href="/"
            className="app-header__nav-link"
            style={{
              fontWeight: 800,
              fontSize: '0.875rem',
              color: '#0f172a',
              padding: '8px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Home
          </Link>

          {/* 2. Search Profile Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('search')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              href="/search"
              className="app-header__nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 800,
                fontSize: '0.875rem',
                color: activeDropdown === 'search' ? '#059669' : '#0f172a',
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <Search size={15} style={{ color: '#059669' }} />
              Search Profile
              <ChevronDown
                size={14}
                style={{
                  transform: activeDropdown === 'search' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </Link>

            {activeDropdown === 'search' && (
              <div
                className="card-3d"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: 270,
                  padding: 10,
                  zIndex: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: '#ffffff',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 4px 0 0 #059669',
                }}
              >
                {[
                  { label: '👔 By Profession (Bride & Groom)', href: '/search?filter=profession' },
                  { label: '🗣️ By Mother Tongue / Language', href: '/search?filter=language' },
                  { label: '🆔 Search By Profile ID', href: '/search?filter=profile_id' },
                  { label: '🏙️ Search By City & US State', href: '/search?filter=city' },
                  { label: '🌍 Search By Living Country', href: '/search?filter=country' },
                  { label: '⭐ By Special Case (Male / Female)', href: '/search?filter=special' },
                  { label: '🎂 Search By Age Bracket', href: '/search?filter=age' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#ecfdf5')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. Success Stories */}
          <Link
            href="/stories"
            className="app-header__nav-link"
            style={{
              fontWeight: 800,
              fontSize: '0.875rem',
              color: '#0f172a',
              padding: '8px 14px',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Success Stories
          </Link>

          {/* 4. Wedding Services Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('wedding')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              href="/services"
              className="app-header__nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 800,
                fontSize: '0.875rem',
                color: activeDropdown === 'wedding' ? '#059669' : '#0f172a',
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <Heart size={15} style={{ color: '#e11d48' }} />
              Wedding Services
              <ChevronDown
                size={14}
                style={{
                  transform: activeDropdown === 'wedding' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </Link>

            {activeDropdown === 'wedding' && (
              <div
                className="card-3d"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: 290,
                  padding: 10,
                  zIndex: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: '#ffffff',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 4px 0 0 #e11d48',
                }}
              >
                {[
                  {
                    icon: <Building size={16} style={{ color: '#059669' }} />,
                    label: 'Venue, Halls & Mosques',
                    sub: 'Premier Nikah halls & masjid rentals',
                    href: '/services#venues',
                  },
                  {
                    icon: <Utensils size={16} style={{ color: '#d97706' }} />,
                    label: '100% Halal Catering',
                    sub: 'Gourmet certified Halal wedding feasts',
                    href: '/services#catering',
                  },
                  {
                    icon: <Camera size={16} style={{ color: '#0284c7' }} />,
                    label: 'Modest Cinema & Photography',
                    sub: 'Gender-segregated & Shariah-compliant crews',
                    href: '/services#photography',
                  },
                  {
                    icon: <Flower2 size={16} style={{ color: '#e11d48' }} />,
                    label: 'Stage & Floral Decor',
                    sub: 'Elegant bespoke Nikah stage setups',
                    href: '/services#decor',
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                        {item.sub}
                      </span>
                    </div>
                  </Link>
                ))}

                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 6, paddingTop: 6 }}>
                  <Link
                    href="/services"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1px solid rgba(5, 150, 105, 0.3)',
                      color: '#047857',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Sparkles size={14} />
                    View All Wedding Services
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 5. Trust & Guidance (Why Marriage Media USA) Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('trust')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              href="/why-us"
              className="app-header__nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 800,
                fontSize: '0.875rem',
                color: activeDropdown === 'trust' ? '#059669' : '#0f172a',
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#059669' }} />
              Trust & Guidance
              <ChevronDown
                size={14}
                style={{
                  transform: activeDropdown === 'trust' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </Link>

            {activeDropdown === 'trust' && (
              <div
                className="card-3d"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: 275,
                  padding: 10,
                  zIndex: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: '#ffffff',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 4px 0 0 #059669',
                }}
              >
                {[
                  {
                    icon: <Lock size={16} style={{ color: '#059669' }} />,
                    label: 'Safety & Trust',
                    sub: '10-Level Profile & Wali Verification',
                    href: '/why-us#safety',
                  },
                  {
                    icon: <BookOpen size={16} style={{ color: '#0284c7' }} />,
                    label: 'Guideline & Islamic Advice',
                    sub: 'Sacred rights of spouses, Mahr & Wali',
                    href: '/how-it-works',
                  },
                  {
                    icon: <Info size={16} style={{ color: '#7c3aed' }} />,
                    label: 'About Marriage Media USA',
                    sub: 'Our Islamic ethics, mission & history',
                    href: '/why-us',
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                        {item.sub}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ============================================================
            4. DESKTOP ACTIONS: LOGIN / DASHBOARD & DRAWER (>= 768px)
           ============================================================ */}
        <div className="app-header__desktop-actions" style={{ alignItems: 'center', gap: 10 }}>
          {currentUser?.authenticated ? (
            <>
              {currentUser.user?.role === 'SUPER_ADMIN' || currentUser.user?.role === 'ADMIN' ? (
                <Link
                  href="/admin"
                  className="btn-3d"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                  }}
                >
                  <Crown size={14} style={{ color: '#F59E0B' }} />
                  Admin Console
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn-3d"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={14} style={{ color: '#059669' }} />
                  Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#DC2626',
                  background: '#FEF2F2',
                  border: '1px solid #FECDD3',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 3px 0 #94a3b8, 0 6px 12px rgba(15, 23, 42, 0.08)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={14} style={{ color: '#059669' }} />
                Login
              </Link>

              {/* FREE Registration Button */}
              <Link
                href="/register"
                className="btn-3d-crimson"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  borderRadius: 12,
                }}
              >
                <Sparkles size={14} />
                FREE Registration
              </Link>
            </>
          )}
        </div>

        {/* ============================================================
            5. MOBILE ACTIONS (< 768px COMPACT PILL BUTTONS)
           ============================================================ */}
        <div className="app-header__mobile-actions" style={{ alignItems: 'center', gap: 6 }}>
          {currentUser?.authenticated ? (
            <>
              <Link
                href={currentUser.user?.role === 'SUPER_ADMIN' || currentUser.user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="btn-3d"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                {currentUser.user?.role === 'SUPER_ADMIN' || currentUser.user?.role === 'ADMIN' ? (
                  <>
                    <Crown size={13} style={{ color: '#F59E0B' }} />
                    Admin
                  </>
                ) : (
                  <>
                    <LayoutDashboard size={13} style={{ color: '#059669' }} />
                    Dashboard
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign Out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#FEF2F2',
                  border: '1px solid #FECDD3',
                  color: '#DC2626',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: '#0f172a',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 0 #94a3b8',
                  textDecoration: 'none',
                }}
              >
                <User size={13} style={{ color: '#059669' }} />
                Login
              </Link>
              <Link
                href="/register"
                className="btn-3d-crimson"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Sparkles size={12} />
                Join
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ============================================================
          6. PROFESSIONAL SLIDE-OVER DRAWER SHEET (FROM LEFT)
         ============================================================ */}
      {drawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Right Slide-Over Panel */}
          <aside className="drawer-panel" aria-label="Mobile and Quick Menu">
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderBottom: '1.5px solid #e2e8f0',
                background: '#ffffff',
              }}
            >
              <div className="brand-logo-badge">
                <img
                  src="/logo.png"
                  alt="Marriage Media USA"
                  style={{ height: 32, width: 'auto', display: 'block' }}
                />
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close Navigation Menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div
              style={{
                padding: '1.25rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                flex: 1,
              }}
            >
              {/* Group 1: Core Navigation */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  Quick Navigation
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      textDecoration: 'none',
                      background: '#f8fafc',
                    }}
                  >
                    🏠 Home
                  </Link>
                  <Link
                    href="/search"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      textDecoration: 'none',
                    }}
                  >
                    🔍 Search Profiles
                  </Link>
                  <Link
                    href="/stories"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      textDecoration: 'none',
                    }}
                  >
                    💍 Real Success Stories
                  </Link>
                </div>
              </div>

              {/* Group 2: Wedding Services */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#e11d48',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  Wedding Services
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: '🏛️ Venue, Halls & Mosques', href: '/services#venues' },
                    { label: '🍲 100% Halal Catering', href: '/services#catering' },
                    { label: '📸 Modest Cinema & Photography', href: '/services#photography' },
                    { label: '🌸 Stage & Floral Decor', href: '/services#decor' },
                    { label: '✨ View All Wedding Services', href: '/services' },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        color: '#1e293b',
                        textDecoration: 'none',
                      }}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group 3: Trust & Guidance */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  Trust & Guidance
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: '🛡️ Safety & Trust (10-Level KYC)', href: '/why-us#safety' },
                    { label: '📖 Guideline & Islamic Advice', href: '/how-it-works' },
                    { label: 'ℹ️ About Marriage Media USA', href: '/why-us' },
                    { label: '💎 Membership Plans', href: '/membership-plan' },
                  ].map((t) => (
                    <Link
                      key={t.label}
                      href={t.href}
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        color: '#1e293b',
                        textDecoration: 'none',
                      }}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group 4: Members Hub */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  Member Lounge
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Link
                    href="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: '#1e293b',
                      textDecoration: 'none',
                    }}
                  >
                    📊 Member Dashboard
                  </Link>
                  <Link
                    href="/proposals"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: '#1e293b',
                      textDecoration: 'none',
                    }}
                  >
                    💌 Proposals Pipeline
                  </Link>
                  <Link
                    href="/chat"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: '#1e293b',
                      textDecoration: 'none',
                    }}
                  >
                    💬 Halal Chat Lounge
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1.25rem',
                borderTop: '1.5px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {currentUser?.authenticated ? (
                <>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                      {currentUser.user?.fullName || currentUser.user?.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                      Role: {currentUser.user?.role} • Tier: {currentUser.user?.tier}
                    </div>
                  </div>

                  {currentUser.user?.role === 'SUPER_ADMIN' || currentUser.user?.role === 'ADMIN' ? (
                    <Link
                      href="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-3d"
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        borderRadius: 12,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <Crown size={16} style={{ color: '#F59E0B' }} />
                      Admin Console
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-3d"
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        borderRadius: 12,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <LayoutDashboard size={16} style={{ color: '#059669' }} />
                      Member Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 18px',
                      borderRadius: 12,
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#DC2626',
                      background: '#FEF2F2',
                      border: '1.5px solid #FECDD3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-3d-crimson"
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: 12,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Sparkles size={16} />
                    FREE Registration Now
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      width: '100%',
                      padding: '11px 18px',
                      borderRadius: 12,
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <User size={15} style={{ color: '#059669' }} />
                    Login to Your Account
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
