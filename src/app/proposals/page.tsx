'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { ProposalManager } from '@/components/social/ProposalManager';
import { ProposalService } from '@/lib/social/proposals';
import { useRequireAuth } from '@/lib/firebase/useRequireAuth';
import { Heart, ShieldCheck } from 'lucide-react';

export default function ProposalsPage() {
  const { user, isLoading } = useRequireAuth();

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
            Verifying Authentication & Loading Proposals...
          </p>
        </div>
      </div>
    );
  }

  const proposals = ProposalService.getProposalsForUser(user.uid);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <AppHeader />

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: 'var(--space-2xl) var(--space-md)', width: '100%', flex: 1 }}>
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(217, 119, 6, 0.06) 100%)',
            border: '1.5px solid var(--emerald-200)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-crimson)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              }}
            >
              <Heart size={24} color="#fff" fill="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Matrimonial Proposal Pipeline
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Manage sent, received, accepted, and guardian-verified marriage expressions
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid var(--emerald-200)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--emerald-800)',
            }}
          >
            <ShieldCheck size={16} color="var(--emerald-600)" />
            <span>Wali Direct Notification Active</span>
          </div>
        </div>

        {/* Manager Component */}
        <ProposalManager initialProposals={proposals} currentUserId={user.uid} />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
