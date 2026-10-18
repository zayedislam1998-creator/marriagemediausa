'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  FileText,
  Heart,
  Coins,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { MemberOverviewTab } from './MemberOverviewTab';
import { MemberProfileTab } from './MemberProfileTab';
import { MemberCvStudioTab } from './MemberCvStudioTab';
import { MemberResumeRecord } from '@/db/queries';
import { Package } from '@/db/repository';
import { firebaseLogout } from '@/lib/firebase/authService';
import { useCrossTabSync } from '@/lib/sync/broadcastSync';

interface MemberExecutiveLayoutProps {
  session: {
    userId: string;
    email: string;
    fullName: string;
    tier: string;
    dailyViewLimit: number;
  };
  myProfile: any;
  creditBalance: number;
  curatedMatches: any[];
  packages: Package[];
  resumes: MemberResumeRecord[];
}

export function MemberExecutiveLayout({
  session,
  myProfile,
  creditBalance,
  curatedMatches,
  packages,
  resumes,
}: MemberExecutiveLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'cv' | 'proposals' | 'credits'>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Cross-Tab Reactivity Listener: instantly notify if data updated in another tab!
  useCrossTabSync((msg) => {
    setSyncToast(`✓ Real-time update detected: ${msg.type.replace(/_/g, ' ')}`);
    setTimeout(() => setSyncToast(null), 3500);
  });

  const handleLogout = async () => {
    await firebaseLogout();
    window.location.href = '/login';
  };

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview & Radar',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'var(--emerald-600)',
    },
    {
      id: 'profile' as const,
      label: 'My Profile Studio',
      shortLabel: 'Profile',
      icon: User,
      badge: `${myProfile?.completionPercentage || 75}%`,
      badgeColor: 'var(--gold-600)',
    },
    {
      id: 'cv' as const,
      label: 'Matrimonial CV & Resume',
      shortLabel: 'CV Studio',
      icon: FileText,
      badge: `${resumes.length} Docs`,
      badgeColor: '#7C3AED',
    },
    {
      id: 'proposals' as const,
      label: 'Proposals Pipeline',
      shortLabel: 'Proposals',
      icon: Heart,
      badge: '2 New',
      badgeColor: 'var(--rose-600)',
    },
    {
      id: 'credits' as const,
      label: 'Wallet & Upgrade',
      shortLabel: 'Wallet',
      icon: Coins,
      badge: `${creditBalance} Cr`,
      badgeColor: 'var(--sapphire-600)',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)',
      }}
    >
      {/* ============================================================
          1. 3D EXECUTIVE DESKTOP SIDEBAR (FIXED / COLLAPSIBLE)
         ============================================================ */}
      <aside
        style={{
          width: isCollapsed ? 76 : 270,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'width 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'hidden',
          flexShrink: 0,
          borderRight: '1.5px solid #1E293B',
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Brand & Collapse Header */}
        <div
          style={{
            padding: isCollapsed ? '18px 12px' : '20px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: 10,
          }}
        >
          {!isCollapsed ? (
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--gold-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                }}
              >
                ☪
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                  Marriage Media USA
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600 }}>
                  Member Portal
                </div>
              </div>
            </Link>
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--emerald-500), var(--gold-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}
            >
              ☪
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#94A3B8',
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav
          style={{
            flex: 1,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: isCollapsed ? '12px 0' : '12px 14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.12))'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <Icon size={18} color={isActive ? '#10B981' : '#94A3B8'} style={{ flexShrink: 0 }} />

                {!isCollapsed && (
                  <>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          backgroundColor: '#1E293B',
                          color: item.badgeColor,
                          border: '1px solid #334155',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User & Sign Out */}
        <div
          style={{
            padding: isCollapsed ? '14px 8px' : '16px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {!isCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {session.fullName ? session.fullName[0].toUpperCase() : 'M'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {session.fullName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {session.tier} Member
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link
                  href="/"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#1E293B',
                    color: '#CBD5E1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ExternalLink size={14} /> Public Website
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#F87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================
          2. MOBILE APP HEADER (< 768px)
         ============================================================ */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: '#0F172A',
          color: '#fff',
          zIndex: 50,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
        className="mobile-only-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: 800 }}>Marriage Media USA Portal</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer' }}
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* ============================================================
          3. MAIN EXECUTIVE WORKSPACE (ON-PAGE TAB SWITCHING)
         ============================================================ */}
      <main
        style={{
          flex: 1,
          padding: '24px 32px 60px 32px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Workspace Top Header Bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 16,
            borderBottom: '1.5px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <span className="badge-3d" style={{ fontSize: '0.7rem' }}>
                Member Suite
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Authenticated Member Portal • {session.fullName} ({session.email})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" className="btn-3d" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
              Public Website →
            </Link>
          </div>
        </header>

        {/* Real-Time Sync Toast */}
        {syncToast && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Sparkles size={18} color="#10B981" />
            {syncToast}
          </div>
        )}

        {/* TAB 1: OVERVIEW & RADAR */}
        {activeTab === 'overview' && (
          <MemberOverviewTab
            tier={session.tier}
            fullName={session.fullName}
            creditBalance={creditBalance}
            dailyViewLimit={session.dailyViewLimit}
            curatedMatches={curatedMatches}
            myProfile={myProfile}
            userEmail={session.email}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* TAB 2: MY PROFILE STUDIO */}
        {activeTab === 'profile' && (
          <MemberProfileTab
            myProfile={myProfile}
            userEmail={session.email}
            userId={session.userId}
          />
        )}

        {/* TAB 3: MATRIMONIAL CV & RESUME STUDIO */}
        {activeTab === 'cv' && (
          <MemberCvStudioTab
            initialResumes={resumes}
            userId={session.userId}
            userFullName={session.fullName}
          />
        )}

        {/* TAB 4: PROPOSALS PIPELINE */}
        {activeTab === 'proposals' && (
          <div className="card-3d" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Heart size={24} color="var(--rose-600)" />
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Marriage Proposals Pipeline</h2>
              </div>
              <Link href="/proposals" className="btn-3d">
                Open Full Proposals Center →
              </Link>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Manage all incoming and outgoing marriage inquiries, Wali introductions, and mutual acceptance states.
            </p>
          </div>
        )}

        {/* TAB 5: WALLET & UPGRADE */}
        {activeTab === 'credits' && (
          <div className="card-3d" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Coins size={24} color="var(--gold-600)" />
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Contact Credit Wallet & Packages</h2>
              </div>
              <Link href="/membership-plan" className="btn-3d">
                Upgrade Membership Tier →
              </Link>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
              Current Balance: <strong>{creditBalance} Contact Credits</strong> • Active Tier: <strong>{session.tier}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  style={{
                    padding: '20px',
                    borderRadius: 14,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{pkg.name}</h4>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)', marginBottom: 8 }}>
                    ${(pkg as any).price_usd ?? (pkg as any).priceUsd ?? 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    {(pkg as any).contact_credits ?? (pkg as any).contactCredits ?? 0} Contact Credits • {(pkg as any).daily_profile_view_limit ?? (pkg as any).dailyProfileViewLimit ?? 10} Daily Views
                  </div>
                  <Link href="/membership-plan" className="btn-3d-secondary" style={{ width: '100%', textAlign: 'center', display: 'block', fontSize: '0.8rem' }}>
                    Select Plan
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
