'use client';

import Link from 'next/link';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { EditorCmsStudio } from '@/components/admin/EditorCmsStudio';
import { useRequireAuth } from '@/lib/firebase/useRequireAuth';
import { AccessDenied } from '@/components/auth/AccessDenied';

export default function EditorCmsDashboard() {
  const { user, isLoading, isUnauthorizedRole, logout } = useRequireAuth({ requireRole: 'ADMIN' });

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
            Verifying Editorial Privileges...
          </p>
        </div>
      </div>
    );
  }

  if (isUnauthorizedRole) {
    return (
      <AccessDenied
        userEmail={user.email}
        userRole={user.role || 'MEMBER'}
        requiredRole="Administrator or Editor"
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* CMS Header */}
      <header
        style={{
          background: '#0F172A',
          color: '#fff',
          padding: '12px var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--sapphire-500), var(--violet-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            ✍️
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Editor CMS Content Studio</div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              Authenticated: {user.email} ({user.role})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin" className="btn btn-ghost btn-sm" style={{ color: '#E2E8F0', borderColor: '#334155' }}>
            <ArrowLeft size={14} /> Back to Super Admin
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ color: '#94A3B8' }}>
            View Public Site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main CMS Body */}
      <main style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: 'var(--space-2xl)', width: '100%' }}>
        <div
          style={{
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              Success Stories, Knowledge Base & FAQ Desk
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Publish verified couple testimonials, pre-marital Islamic jurisprudence guides, and homepage spotlight campaigns.
            </p>
          </div>
          <span className="badge badge-sapphire" style={{ padding: '6px 12px' }}>
            <ShieldCheck size={14} /> RBAC Seat Guard: Verified
          </span>
        </div>

        <EditorCmsStudio />
      </main>
    </div>
  );
}
