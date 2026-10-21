'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DomainRepository } from '@/db/repository';
import { MemberExecutiveLayout } from '@/components/dashboard/MemberExecutiveLayout';
import { useRequireAuth } from '@/lib/firebase/useRequireAuth';
import { Crown, ArrowRight, LogOut } from 'lucide-react';

export default function MemberDashboard() {
  const { user, isLoading, isAdmin, logout } = useRequireAuth();
  const [curatedMatches, setCuratedMatches] = useState<any[]>([]);
  const [livePackages, setLivePackages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/profiles/search', { cache: 'no-store' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        return (res.ok && contentType.includes('application/json')) ? res.json() : null;
      })
      .then((data) => {
        if (data?.success && Array.isArray(data.profiles)) {
          setCuratedMatches(data.profiles);
        }
      })
      .catch(() => {});

    fetch('/api/packages', { cache: 'no-store' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        return (res.ok && contentType.includes('application/json')) ? res.json() : null;
      })
      .then((data) => {
        if (data?.success && Array.isArray(data.packages)) {
          setLivePackages(data.packages);
        }
      })
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
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
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Verifying Authentication & Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }


  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', padding: '30px 20px', maxWidth: 420 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid #a7f3d0',
            }}
          >
            <Crown size={24} style={{ color: '#059669' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Authentication Required
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
            Please sign in to access your sacred matrimonial dashboard and curated matches.
          </p>
          <Link
            href="/login?redirect=/dashboard"
            className="btn-3d-emerald"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            Sign In to Account <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const tier = user.membershipTier || 'FREE';
  const creditBalance = Number(user.contactCredits) || 0;
  const dailyLimit = Number(user.dailyViewLimit) || 15;

  return (
    <div>
      {/* Administrator Session Banner (Only visible if an admin visits /dashboard) */}
      {isAdmin && (
        <div
          style={{
            background: 'linear-gradient(90deg, #064e3b 0%, #0f172a 100%)',
            color: '#f8fafc',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #10b981',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexWrap: 'wrap',
            gap: 10,
            position: 'sticky',
            top: 0,
            zIndex: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={16} style={{ color: '#fbbf24' }} />
            <span>
              Administrator Session (<strong>{user.email}</strong>): You are currently viewing the Matrimonial Lounge preview.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/admin"
              className="btn-3d-emerald"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
              }}
            >
              Switch to Admin Console <ArrowRight size={13} />
            </Link>

            <button
              type="button"
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      )}

      <MemberExecutiveLayout
        session={{
          userId: user.uid,
          email: user.email,
          fullName: user.fullName || 'Distinguished Member',
          tier,
          dailyViewLimit: dailyLimit,
        }}
        myProfile={null}
        creditBalance={creditBalance}
        curatedMatches={curatedMatches}
        packages={livePackages}
        resumes={[]}
      />
    </div>
  );
}
