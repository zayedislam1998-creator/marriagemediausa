'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { firebaseLogin, onFirebaseAuthState } from '@/lib/firebase/authService';
import { Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // If already authenticated, redirect intelligently based on role
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
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    });

    return () => unsubscribe();
  }, [router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setCustomError(null);

    const email = identifier.trim().toLowerCase();
    const pass = password.trim();

    try {
      const res = await firebaseLogin(email, pass);
      if (res.success && res.user) {
        const isAdmin =
          res.user.role === 'SUPER_ADMIN' ||
          res.user.role === 'ADMIN' ||
          email.includes('admin') ||
          email === 'skyxamerica24@gmail.com';

        if (redirectParam) {
          if (redirectParam.startsWith('/admin') && !isAdmin) {
            router.push('/dashboard');
          } else {
            router.push(redirectParam);
          }
        } else {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setCustomError(res.error || 'Invalid credentials. Please verify your email and password.');
        setIsPending(false);
      }
    } catch {
      setCustomError('Authentication failed. Please check your network and credentials.');
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
      className="card-3d"
      style={{
        width: '100%',
        maxWidth: 480,
        padding: '36px 32px',
        margin: '0 auto',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/images/logo.png"
            alt="MarriageMediaUSA.com"
            width={170}
            height={50}
            style={{ height: 'auto', maxHeight: 44, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 14, marginBottom: 4 }}>
          Welcome to Marriage Media USA
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sign in to access your secure Halal matrimonial portal
        </p>
      </div>

      {/* Switch Tab */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(15, 23, 42, 0.05)',
          borderRadius: 14,
          padding: 4,
          marginBottom: 24,
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            background: '#fff',
            color: 'var(--emerald-800)',
            fontWeight: 800,
            fontSize: '0.875rem',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            cursor: 'default',
          }}
        >
          Sign In
        </button>
        <Link
          href="/register"
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
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

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Email Address or Phone Number
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="identifier"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone number"
              className="input-3d"
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 12,
                border: '1.5px solid var(--border-medium)',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#fff',
              }}
            />
            <Mail
              size={18}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Password
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-700)', cursor: 'pointer', fontWeight: 600 }}>
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
              placeholder="••••••••"
              className="input-3d"
              style={{
                width: '100%',
                padding: '12px 42px 12px 42px',
                borderRadius: 12,
                border: '1.5px solid var(--border-medium)',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#fff',
              }}
            />
            <Lock
              size={18}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
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
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
            opacity: isPending ? 0.7 : 1,
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

      {/* Halal Trust & Privacy Guarantee */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--emerald-600)' }} />
        <span>100% Islamic Purdah & Verified Privacy Guarantee</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl) var(--space-md)',
      }}
    >
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
