'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Lock, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string; profileId: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMessage('Missing invitation token in the link.');
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/setup-password?token=${encodeURIComponent(token!)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setTokenValid(true);
          setUserInfo(data.user);
        } else {
          setErrorMessage(data.error || 'This invitation link is invalid or has already been used.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to verify invitation link.');
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save password.');
      }

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while creating your password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Verifying your invitation link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="card-3d" style={{ maxWidth: 500, margin: '40px auto', padding: '36px', textAlign: 'center', borderTop: '5px solid #dc2626' }}>
        <AlertCircle size={54} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: 10 }}>
          Invitation Link Expired or Invalid
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
          {errorMessage || 'This invitation link cannot be verified. It may have expired or already been activated.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/login" className="btn-3d-emerald" style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 800 }}>
            Go to Login
          </Link>
          <Link href="/contact" className="btn-3d-gold" style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 800 }}>
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card-3d" style={{ maxWidth: 520, margin: '40px auto', padding: '36px', textAlign: 'center', borderTop: '5px solid #059669' }}>
        <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 16px' }} />
        <span className="badge badge-emerald" style={{ marginBottom: 12 }}>
          Account Successfully Activated
        </span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 10px' }}>
          Welcome, {userInfo?.fullName}!
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.6 }}>
          Your permanent password has been set and your account is ready. You can now sign in using your email (<strong>{userInfo?.email}</strong>) and your chosen password.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="btn-3d-emerald"
          style={{
            padding: '12px 28px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Sign In Now <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="card-3d" style={{ maxWidth: 520, margin: '40px auto', padding: '36px', borderTop: '5px solid #059669' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(5, 150, 105, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <Lock size={24} color="#059669" />
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
          Create Your Password
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          Welcome, <strong>{userInfo?.fullName}</strong> ({userInfo?.email})
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {submitError && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#b91c1c',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {submitError}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#334155', marginBottom: 6 }}>
            New Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input-3d"
              style={{ width: '100%', paddingRight: 40 }}
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
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4, display: 'block' }}>
            Use at least 8 characters. Mix letters, numbers, and symbols for best security.
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#334155', marginBottom: 6 }}>
            Confirm Password *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="input-3d"
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-3d-emerald"
          style={{
            marginTop: 8,
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <ShieldCheck size={18} />
          {submitting ? 'Setting Password...' : 'Activate Account & Set Password'}
        </button>
      </form>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <main style={{ flex: 1, padding: '40px 16px' }}>
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading setup screen...</p>
            </div>
          }
        >
          <SetupPasswordForm />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
