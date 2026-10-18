'use client';

import Link from 'next/link';
import { CreditWalletService } from '@/lib/social/credits';
import { DomainRepository } from '@/db/repository';
import { MemberExecutiveLayout } from '@/components/dashboard/MemberExecutiveLayout';
import { useRequireAuth } from '@/lib/firebase/useRequireAuth';
import { Crown, ArrowRight, LogOut } from 'lucide-react';

export default function MemberDashboard() {
  const { user, isLoading, isAdmin, logout } = useRequireAuth();

  if (isLoading || !user) {
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

  const tier = user.membershipTier || 'GOLD';
  const creditBalance = CreditWalletService.getCreditBalance(user.uid, tier);
  const curatedMatches = DomainRepository.getProfiles();
  const packages = DomainRepository.getPackages();

  const dailyLimit =
    tier === 'ELITE'
      ? 999
      : tier === 'DIAMOND'
      ? 250
      : tier === 'GOLD'
      ? 150
      : tier === 'SILVER'
      ? 50
      : 15;

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
        packages={packages}
        resumes={[]}
      />
    </div>
  );
}
