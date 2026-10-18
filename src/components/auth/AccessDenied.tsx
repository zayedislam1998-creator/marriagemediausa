'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { firebaseLogout } from '@/lib/firebase/authService';

interface AccessDeniedProps {
  userEmail?: string;
  userRole?: string;
  requiredRole?: string;
}

export function AccessDenied({
  userEmail = 'member@marriagemediausa.com',
  userRole = 'MEMBER',
  requiredRole = 'ADMIN',
}: AccessDeniedProps) {
  const handleSignOut = async () => {
    await firebaseLogout();
    window.location.href = '/login?redirect=/admin';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        color: '#f8fafc',
      }}
    >
      <div
        className="card-3d"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '40px 32px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
            marginBottom: 20,
          }}
        >
          <ShieldAlert size={34} color="#fff" />
        </div>

        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#f8fafc',
            marginBottom: 8,
          }}
        >
          Access Denied: {requiredRole} Required
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          You are currently authenticated as{' '}
          <strong style={{ color: '#f1f5f9' }}>{userEmail}</strong> ({userRole} account).
          This executive management portal is strictly restricted to verified system administrators.
        </p>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: '0.8rem',
            color: '#fca5a5',
            fontWeight: 600,
          }}
        >
          🔒 Unauthorized access attempts to administration consoles are logged and monitored.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href="/dashboard"
            className="btn-3d-emerald"
            style={{
              padding: '12px 18px',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            <LayoutDashboard size={16} />
            Go to Member Dashboard
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              padding: '12px 18px',
              fontSize: '0.85rem',
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s ease',
            }}
          >
            <LogOut size={15} />
            Sign Out / Switch Account
          </button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1e293b' }}>
          <Link
            href="/"
            style={{
              color: '#64748b',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={13} /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
