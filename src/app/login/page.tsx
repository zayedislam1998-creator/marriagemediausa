'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { firebaseLogin, onFirebaseAuthState } from '@/lib/firebase/authService';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Heart,
  Users,
  Sparkles,
  Shield,
  MapPin,
  Award,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // If already authenticated via client state
  useEffect(() => {
    const unsubscribe = onFirebaseAuthState((user, loading) => {
      if (loading || !user) return;

      const isAdmin =
        user.role === 'SUPER_ADMIN' ||
        user.role === 'ADMIN' ||
        user.email.toLowerCase().includes('admin') ||
        user.email.toLowerCase() === 'skyxamerica24@gmail.com';

      if (redirectParam) {
        if (redirectParam.startsWith('/admin') && !isAdmin) {
          router.push('/dashboard');
        } else {
          router.push(redirectParam);
        }
      } else {
        router.push(isAdmin ? '/admin' : '/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router, redirectParam]);

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
        // Also sync client-side Firebase if available
        try {
          await firebaseLogin(idVal, passVal);
        } catch {
          // Firebase sync optional fallback
        }

        const isAdmin =
          serverData.user?.role === 'SUPER_ADMIN' ||
          serverData.user?.role === 'ADMIN' ||
          idVal.includes('admin') ||
          idVal === 'skyxamerica24@gmail.com';

        if (redirectParam) {
          if (redirectParam.startsWith('/admin') && !isAdmin) {
            router.push('/dashboard');
          } else {
            router.push(redirectParam);
          }
        } else {
          router.push(isAdmin ? '/admin' : '/dashboard');
        }
        return;
      }

      // 2. Fallback to Firebase directly if local user record differs
      const fbRes = await firebaseLogin(idVal, passVal);
      if (fbRes.success && fbRes.user) {
        const isAdmin =
          fbRes.user.role === 'SUPER_ADMIN' ||
          fbRes.user.role === 'ADMIN' ||
          idVal.includes('admin') ||
          idVal === 'skyxamerica24@gmail.com';

        router.push(isAdmin ? '/admin' : '/dashboard');
        return;
      }

      setCustomError(serverData.error || fbRes.error || 'Invalid credentials. Please verify your email/phone and password.');
      setIsPending(false);
    } catch {
      setCustomError('Authentication service temporarily unavailable. Please verify your credentials and network connection.');
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
        maxWidth: 1140,
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 40,
        alignItems: 'center',
      }}
    >
      {/* ============================================================
          LEFT COLUMN: BRAND SHOWCASE & ISLAMIC TRUST PILLARS
         ============================================================ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: '16px 8px',
        }}
      >
        {/* Brand Header */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 30,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#047857',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <Sparkles size={15} />
            <span>North America & Global Matrimonial Network</span>
          </div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Find Your Sincere Life Partner with Complete Islamic Dignity
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#475569',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Marriage Media USA connects practicing Muslim professionals and respected families across all 50 US States, Canada, UK, Australia, and worldwide with verified Walis and strict Purdah photo privacy.
          </p>
        </div>

        {/* 4 Trust Value Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: '#FFFFFF',
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                100% Halal Guardian-Approved Matches
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                Direct family and Wali involvement for every sister according to authentic Prophetic Sunnah.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: '#FFFFFF',
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                Purdah Photo Modesty Shield
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                Server-side 24px Gaussian blur protection. Photos are only revealed with mutual consent.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: '#FFFFFF',
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                Verified KYC & Career Badges
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                Passports, education, and professional credentials vetted by human moderators in private vaults.
              </p>
            </div>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            padding: '14px 20px',
            borderRadius: 14,
            color: '#fff',
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>15,400+</div>
            <div style={{ fontSize: '0.725rem', color: '#A7F3D0', fontWeight: 600 }}>Active Members</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FCD34D' }}>2,800+</div>
            <div style={{ fontSize: '0.725rem', color: '#FDE68A', fontWeight: 600 }}>Blessed Nikkahs</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6EE7B7' }}>100%</div>
            <div style={{ fontSize: '0.725rem', color: '#A7F3D0', fontWeight: 600 }}>Halal Compliant</div>
          </div>
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN: SLEEK SIGN IN CARD
         ============================================================ */}
      <div
        className="card-3d"
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          width: '100%',
        }}
      >
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6, margin: 0 }}>
            Sign in to access your secure Halal matrimonial portal
          </p>
        </div>

        {/* Switch Tab: Sign In vs Create Account */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            style={{
              padding: '10px 16px',
              borderRadius: 9,
              background: '#FFFFFF',
              color: '#065F46',
              fontWeight: 800,
              fontSize: '0.875rem',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              cursor: 'default',
            }}
          >
            Sign In
          </button>
          <Link
            href="/register"
            style={{
              padding: '10px 16px',
              borderRadius: 9,
              textAlign: 'center',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Create Account
          </Link>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.85rem',
              color: '#BE123C',
              marginBottom: 20,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
              Email Address or Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="identifier"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your registered email or phone"
                className="input-3d"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0F172A',
                }}
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                Password
              </label>
              <span
                onClick={() => alert('Password reset link will be sent to your registered email address.')}
                style={{
                  fontSize: '0.75rem',
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
                placeholder="Enter your secure password"
                className="input-3d"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0F172A',
                }}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
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
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#059669', width: 16, height: 16 }}
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-3d"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.75 : 1,
              marginTop: 6,
            }}
          >
            {isPending ? (
              'Authenticating...'
            ) : (
              <>
                Sign In Securely <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Halal Guarantee Badge */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.75rem',
            color: '#64748B',
          }}
        >
          <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
          <span>256-Bit SSL Encrypted • Strictly Halal & Verified Privacy</span>
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
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 70%)',
      }}
    >
      {/* 1. Official Platform Header */}
      <AppHeader />

      {/* 2. Main Executive 2-Column Auth Workspace */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      {/* 3. Official Platform Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <BottomNav />
    </div>
  );
}
