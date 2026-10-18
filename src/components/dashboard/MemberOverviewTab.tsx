'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Eye,
  Award,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { VisitorRadarWidget } from '@/components/social/VisitorRadarWidget';

interface MemberOverviewTabProps {
  tier: string;
  fullName: string;
  creditBalance: number;
  dailyViewLimit: number;
  curatedMatches: any[];
  myProfile: any;
  userEmail: string;
  onNavigateToTab: (tabId: string) => void;
}

export function MemberOverviewTab({
  tier,
  fullName,
  creditBalance,
  dailyViewLimit,
  curatedMatches,
  myProfile,
  userEmail,
  onNavigateToTab,
}: MemberOverviewTabProps) {
  const isFree = tier === 'FREE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Welcome Executive Banner */}
      <div
        className="card-3d"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>👋</span>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC' }}>
              Welcome back, {fullName}!
            </h1>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: '#94A3B8' }}>
            Sunnah Matrimonial Portal • Authenticated as {userEmail} • Verified ID #{myProfile?.profileId || '2026'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onNavigateToTab('profile')}
            className="btn-3d"
            style={{ fontSize: '0.85rem', padding: '9px 16px' }}
          >
            Edit Biodata
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('cv')}
            className="btn-3d-secondary"
            style={{ fontSize: '0.85rem', padding: '9px 16px', background: '#334155', color: '#fff' }}
          >
            Matrimonial CV
          </button>
        </div>
      </div>

      {/* 2. Executive Stat KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Membership Tier */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>MEMBERSHIP SEAT</span>
            <Award size={18} color="var(--gold-600)" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 2px 0', color: 'var(--text-main)' }}>
            {tier}
          </div>
          <div style={{ fontSize: '0.75rem', color: isFree ? '#DC2626' : 'var(--emerald-600)', fontWeight: 600 }}>
            {isFree ? 'Explorer Free Seat' : 'Verified Premium Active'}
          </div>
        </div>

        {/* Card 2: Contact Credits */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CONTACT CREDITS</span>
            <Users size={18} color="var(--emerald-600)" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 2px 0', color: 'var(--emerald-600)' }}>
            {creditBalance}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available to unlock Walis</div>
        </div>

        {/* Card 3: Daily Profile Views */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>DAILY VIEW LIMIT</span>
            <Eye size={18} color="var(--sapphire-600)" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 2px 0', color: 'var(--text-main)' }}>
            {dailyViewLimit} / day
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Refreshes every 24h</div>
        </div>

        {/* Card 4: Profile Completion */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>BIODATA STATUS</span>
            <Sparkles size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 2px 0', color: '#7C3AED' }}>
            {myProfile?.completionPercentage || 75}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {myProfile?.completionPercentage >= 80 ? 'Verified & Listed' : 'Incomplete'}
          </div>
        </div>
      </div>

      {/* 3. Dual Columns: Proposal Pipeline & Visitor Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
        {/* Proposal Inbox */}
        <div className="card-3d" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart size={20} color="var(--rose-600)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Marriage Proposals Pipeline</h3>
            </div>
            <Link
              href="/proposals"
              style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 700, textDecoration: 'none' }}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 12,
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Dr. Ayesha Siddiqa (Physician)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  New York, NY • 94% Compatibility Match
                </div>
              </div>
              <Link href="/proposals" className="btn-3d-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                Review
              </Link>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 12,
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Fatima Zahra (Civil Engineer)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Houston, TX • 89% Compatibility Match
                </div>
              </div>
              <Link href="/proposals" className="btn-3d-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                Review
              </Link>
            </div>
          </div>
        </div>

        {/* Visitor Radar ("Who Viewed My Profile") */}
        <VisitorRadarWidget />
      </div>

      {/* 4. Curated Matrimonial Matches Stream */}
      <div className="card-3d" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Algorithmic Compatible Matches</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Curated by religious values, prayer regularity, location, and career alignment
            </p>
          </div>
          <Link href="/search" className="btn-3d-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            Browse All Profiles →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {curatedMatches.slice(0, 4).map((match, idx) => (
            <div
              key={match.id || idx}
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={match.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'}
                    alt={match.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {match.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {match.profession} • {match.age} yrs
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                📍 {match.location} • {match.matchScore || 92}% Match Score
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  href={`/profile/${match.profileId || match.id}`}
                  className="btn-3d-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px', textAlign: 'center' }}
                >
                  View Biodata
                </Link>
                <Link
                  href="/proposals"
                  className="btn-3d"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px', textAlign: 'center' }}
                >
                  Propose
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
