'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { firebaseLogin, firebaseLogout } from '@/lib/firebase/authService';
import { executeUniversalLogout } from '@/lib/auth/universalLogout';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Users,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect');
  const loggedOutParam = searchParams.get('logged_out') || searchParams.get('logout');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [existingSession, setExistingSession] = useState<{
    email: string;
    role: string;
    fullName?: string;
  } | null>(null);

  useEffect(() => {
    // If arriving from explicit logout, purge any lingering Firebase auth state
    if (loggedOutParam) {
      firebaseLogout();
      return;
    }

    // Inspect if user already has an active session without auto-redirecting them away
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setExistingSession(data.user);
          }
        }
      } catch {}
    };

    checkActiveSession();
  }, [loggedOutParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setCustomError(null);

    const idVal = identifier.trim().toLowerCase();
    const passVal = password.trim();

    try {
      // 1. Authenticate with Next.js Server & PostgreSQL to set HTTP-Only cookie
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idVal, password: passVal }),
      });

      const serverData = await serverRes.json();

      if (serverRes.ok && serverData.success) {
        try {
          await firebaseLogin(idVal, passVal);
        } catch {
          // Firebase fallback optional
        }

        const isAdmin =
          serverData.user?.role === 'SUPER_ADMIN' ||
          serverData.user?.role === 'ADMIN' ||
          idVal.includes('admin') ||
          idVal === 'skyxamerica24@gmail.com';

        let target = isAdmin ? '/admin' : '/dashboard';
        if (redirectParam) {
          if (redirectParam.startsWith('/admin') && !isAdmin) {
            target = '/dashboard';
          } else {
            target = redirectParam;
          }
        }

        // Hard redirect to ensure HTTP-Only session cookies & edge middleware sync immediately
        window.location.href = target;
        return;
      }

      // 2. Client-side Firebase fallback
      const fbRes = await firebaseLogin(idVal, passVal);
      if (fbRes.success && fbRes.user) {
        const isAdmin =
          fbRes.user.role === 'SUPER_ADMIN' ||
          fbRes.user.role === 'ADMIN' ||
          idVal.includes('admin') ||
          idVal === 'skyxamerica24@gmail.com';

        const target = isAdmin ? '/admin' : '/dashboard';
        window.location.href = target;
        return;
      }

      setCustomError(serverData.error || fbRes.error || 'Invalid credentials. Please verify your email/phone and password.');
      setIsPending(false);
    } catch {
      setCustomError('Authentication service temporarily unavailable. Please verify your connection.');
      setIsPending(false);
    }
  };

  const getErrorMessage = () => {
    if (customError) return customError;
    if (errorParam === 'admin_unauthorized') return 'Access Denied: Super Administrator privileges required.';
    if (errorParam === 'editor_unauthorized') return 'Access Denied: Editorial privileges required.';
    if (errorParam === 'moderator_unauthorized') return 'Access Denied: Moderator privileges required.';
    if (errorParam === 'auth_required') return 'Please sign in to access your secured matrimonial portal.';
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 980,
        margin: '0 auto',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(6, 78, 59, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.15fr)',
        background: '#FFFFFF',
      }}
      className="auth-unified-card"
    >
      {/* ============================================================
          LEFT PANEL: UNIFIED DARK EMERALD BRAND SHOWCASE
         ============================================================ */}
      <div
        style={{
          background: 'linear-gradient(150deg, #064E3B 0%, #043D2E 45%, #022C22 100%)',
          padding: '40px 32px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Decorative Background Circles */}
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo Badge in Clean White Pill */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Marriage Media USA"
                  style={{ height: 32, width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </Link>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Islamic Matrimonial Network
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Welcome back to Marriage Media USA
          </h1>

          <p style={{ fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.55, margin: '0 0 28px 0', opacity: 0.9 }}>
            Connecting practicing Muslim professionals and respected families across North America and worldwide with complete dignity.
          </p>

          {/* 3 Dark Translucent Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'rgba(16, 185, 129, 0.25)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                  100% Halal Guardian Oversight
                </div>
                <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                  Wali involvement for every candidate
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'rgba(239, 68, 68, 0.25)',
                  color: '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Purdah Modesty Photo Shield
                </div>
                <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                  24px Gaussian blur protection until mutual consent
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'rgba(59, 130, 246, 0.25)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                  North America & Global Diaspora
                </div>
                <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                  Over 15,400 practicing Muslim professionals
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer Label */}
        <div style={{ fontSize: '0.725rem', color: 'rgba(209, 250, 229, 0.65)', marginTop: 24, position: 'relative', zIndex: 1 }}>
          Marriage Media USA • Member Portal
        </div>
      </div>

      {/* ============================================================
          RIGHT PANEL: CLEAN, SLEEK SIGN IN FORM
         ============================================================ */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Switcher Tab: Sign In vs Create Account */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
            border: '1px solid #E2E8F0',
          }}
        >
          <button
            type="button"
            style={{
              padding: '9px 16px',
              borderRadius: 9,
              background: '#FFFFFF',
              color: '#065F46',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              cursor: 'default',
            }}
          >
            Sign In
          </button>
          <Link
            href="/register"
            style={{
              padding: '9px 16px',
              borderRadius: 9,
              textAlign: 'center',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </Link>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Member & Executive Sign In
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: 4, margin: 0 }}>
            Sign in with your email address or phone number.
          </p>
        </div>

        {/* Logout Success Alert */}
        {loggedOutParam && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.825rem',
              color: '#065F46',
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#059669' }} />
            <span style={{ fontWeight: 600 }}>
              You have been successfully signed out. Please enter your credentials to sign in again.
            </span>
          </div>
        )}

        {/* Existing Active Session Alert */}
        {!loggedOutParam && existingSession && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: '0.785rem', color: '#475569', marginBottom: 8 }}>
              Currently signed in as{' '}
              <strong style={{ color: '#0F172A' }}>{existingSession.email}</strong> (
              <span style={{ color: '#059669', fontWeight: 700 }}>{existingSession.role}</span>)
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  const target =
                    existingSession.role === 'SUPER_ADMIN' || existingSession.role === 'ADMIN'
                      ? '/admin'
                      : '/dashboard';
                  window.location.href = target;
                }}
                style={{
                  padding: '6px 12px',
                  background: '#059669',
                  color: '#FFFFFF',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Go to {existingSession.role.includes('ADMIN') ? 'Admin Console' : 'Dashboard'}
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeUniversalLogout('/login?logged_out=1')}
                style={{
                  padding: '6px 12px',
                  background: '#FFF1F2',
                  color: '#BE123C',
                  borderRadius: 7,
                  border: '1px solid #FECDD3',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: '#BE123C',
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email or Phone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.785rem', fontWeight: 700, color: '#1E293B' }}>
              Email Address or Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="identifier"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or phone number"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  transition: 'border-color 0.2s',
                }}
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.785rem', fontWeight: 700, color: '#1E293B' }}>
                Password
              </label>
              <span
                onClick={() => alert('Password reset instructions will be sent to your registered email.')}
                style={{
                  fontSize: '0.725rem',
                  color: '#059669',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '11px 38px 11px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  transition: 'border-color 0.2s',
                }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: '0.775rem', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#059669', width: 15, height: 15 }}
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-3d"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.75 : 1,
              marginTop: 4,
            }}
          >
            {isPending ? (
              'Signing in...'
            ) : (
              <>
                Sign In Securely <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Switch Link */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
          New to Marriage Media USA?{' '}
          <Link href="/register" style={{ color: '#059669', fontWeight: 800, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>

        {/* Privacy Note */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.725rem',
            color: '#94A3B8',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#059669' }} />
          <span>Your information is protected with 256-bit SSL encryption.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 75%)',
      }}
    >
      <AppHeader />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
