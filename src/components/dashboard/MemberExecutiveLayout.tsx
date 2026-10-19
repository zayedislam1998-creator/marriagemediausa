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
  ChevronDown,
  Bell,
  Settings,
  CreditCard,
  Zap,
  CheckCircle2,
  Lock,
  Award,
} from 'lucide-react';
import { MemberOverviewTab } from './MemberOverviewTab';
import { MemberProfileTab } from './MemberProfileTab';
import { MemberCvStudioTab } from './MemberCvStudioTab';
import { MemberPaymentModal, PaymentItem } from './MemberPaymentModal';
import { MemberResumeRecord } from '@/db/queries';
import { Package } from '@/db/repository';
import { executeUniversalLogout } from '@/lib/auth/universalLogout';
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
  creditBalance: initialCreditBalance,
  curatedMatches,
  packages: initialPackages,
  resumes,
}: MemberExecutiveLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'cv' | 'proposals' | 'credits'>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Dynamic state for live packages and credits
  const [livePackages, setLivePackages] = useState<any[]>(initialPackages);
  const [balance, setBalance] = useState<number>(initialCreditBalance);
  const [currentTier, setCurrentTier] = useState<string>(session.tier);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentItem, setActivePaymentItem] = useState<PaymentItem | null>(null);

  const fetchLivePackages = () => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setLivePackages(data.packages);
        }
      })
      .catch((e) => console.error('Error fetching live packages for member:', e));
  };

  // Fetch live packages from PostgreSQL on mount
  React.useEffect(() => {
    fetchLivePackages();
  }, []);

  // Cross-Tab Reactivity Listener: instantly update if data updated in another tab!
  useCrossTabSync((msg) => {
    if (msg.type === 'PACKAGE_UPDATED') {
      fetchLivePackages();
    }
    setSyncToast(`✓ Real-time update detected: ${msg.type.replace(/_/g, ' ')}`);
    setTimeout(() => setSyncToast(null), 3500);
  });

  const handleLogout = async () => {
    await executeUniversalLogout('/login?logged_out=1');
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
      badge: `${balance} Cr`,
      badgeColor: 'var(--sapphire-600)',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
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
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
            minHeight: 0,
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

        {/* Sidebar Footer User & Sign Out (Pinned & Never Scrolled Out) */}
        <div
          style={{
            padding: isCollapsed ? '14px 8px' : '16px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            flexShrink: 0,
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
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          padding: '20px 32px 60px 32px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Workspace Top Header Bar with Profile Avatar Dropdown */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 14,
            borderBottom: '1.5px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <span className="badge-3d" style={{ fontSize: '0.6875rem' }}>
                Member Suite
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Authenticated Member Portal • {session.fullName} ({session.email})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/"
              style={{
                fontSize: '0.78rem',
                padding: '7px 14px',
                borderRadius: 8,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <ExternalLink size={13} /> Public Website
            </Link>

            {/* Profile Avatar Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 12px 4px 6px',
                  borderRadius: 24,
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  {session.fullName ? session.fullName[0].toUpperCase() : 'M'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                    {session.fullName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                    {session.tier} Member
                  </div>
                </div>
                <ChevronDown size={14} color="#64748B" />
              </button>

              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 250,
                    background: '#FFFFFF',
                    borderRadius: 14,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: '1px solid #E2E8F0',
                    padding: 8,
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>{session.fullName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{session.email}</div>
                    <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 10, background: '#ECFDF5', color: '#065F46', fontSize: '0.68rem', fontWeight: 700 }}>
                      ID #{myProfile?.profileId || '2026-ACTIVE'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#334155', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <User size={15} color="#059669" /> My Profile Studio
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('cv'); setProfileDropdownOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#334155', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <FileText size={15} color="#7C3AED" /> Matrimonial CV & Resume
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('proposals'); setProfileDropdownOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#334155', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Heart size={15} color="#E11D48" /> Proposals Pipeline
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('credits'); setProfileDropdownOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#334155', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Coins size={15} color="#D97706" /> Wallet & Upgrade
                  </button>

                  <div style={{ height: 1, background: '#F1F5F9', margin: '6px 0' }} />

                  <button
                    type="button"
                    onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'rgba(239,68,68,0.06)', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
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
            tier={currentTier}
            fullName={session.fullName}
            creditBalance={balance}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Wallet Balance Hero Card */}
            <div
              className="card-3d"
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
                color: '#fff',
                borderRadius: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Coins size={22} color="#FBBF24" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Halal Contact Credit Wallet
                    </span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: 4, letterSpacing: '-0.5px' }}>
                    {balance}{' '}
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94A3B8' }}>Credits Available</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: 4 }}>
                    Active Plan: <strong style={{ color: '#FDE68A' }}>{currentTier} Member</strong> • Spend 1 credit to instantly unlock candidate and guardian (Wali) phone numbers.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentItem({
                        type: 'WALLET_TOPUP',
                        title: '30 Contact Credits Pack',
                        price: 35,
                        credits: 30,
                      });
                      setPaymentModalOpen(true);
                    }}
                    className="btn-3d"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Zap size={16} /> Quick Recharge (30 Credits)
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: DIRECT CONTACT CREDIT PACKS */}
            <div className="card-3d" style={{ padding: '24px 28px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={20} color="#D97706" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    Direct Contact Credit Packs (No Subscription Required)
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Need to contact a specific suitor immediately? Top up your contact credits directly via Stripe or PayPal without changing your membership plan.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { title: '10 Credits Pack', credits: 10, price: 15, perCredit: '$1.50 / unlock', badge: null },
                  { title: '30 Credits Pack', credits: 30, price: 35, perCredit: '$1.16 / unlock', badge: 'MOST POPULAR' },
                  { title: '80 Credits Pack', credits: 80, price: 75, perCredit: '$0.93 / unlock', badge: 'BEST VALUE' },
                  { title: '200 Credits Pack', credits: 200, price: 150, perCredit: '$0.75 / unlock', badge: 'VIP EXPLORER' },
                ].map((pack, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: 14,
                      border: pack.badge ? '2px solid #059669' : '1px solid #E2E8F0',
                      background: pack.badge ? '#ECFDF5' : '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {pack.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -10,
                          right: 14,
                          background: '#059669',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 10,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {pack.badge}
                      </span>
                    )}

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{pack.title}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', margin: '8px 0 4px' }}>
                        ${pack.price}{' '}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>USD</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 16 }}>
                        {pack.credits} Candidate & Wali Phone Unlocks • {pack.perCredit}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePaymentItem({
                          type: 'WALLET_TOPUP',
                          title: pack.title,
                          price: pack.price,
                          credits: pack.credits,
                        });
                        setPaymentModalOpen(true);
                      }}
                      className={pack.badge ? 'btn-3d' : 'btn-3d-secondary'}
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <CreditCard size={14} /> Buy {pack.credits} Credits
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: OFFICIAL MEMBERSHIP PACKAGES */}
            <div className="card-3d" style={{ padding: '24px 28px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="#6366F1" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    Membership Plans (Admin Database Controlled)
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Upgrade your membership tier to enjoy daily profile view allowances, verified badges, and complimentary contact credits. Zero mock data.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {livePackages
                  .filter((p) => p.isActive !== false)
                  .map((pkg) => {
                    const price = parseFloat(pkg.price_usd ?? pkg.priceUsd ?? 0);
                    const credits = pkg.contact_credits ?? pkg.contactCredits ?? 0;
                    const views = pkg.daily_profile_view_limit ?? pkg.dailyProfileViewLimit ?? 15;
                    const duration = pkg.duration_months ?? pkg.durationMonths ?? 1;
                    const isFree = price === 0;

                    return (
                      <div
                        key={pkg.id}
                        style={{
                          padding: '22px',
                          borderRadius: 14,
                          border: '1.5px solid #E2E8F0',
                          backgroundColor: '#FAFAFA',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                              {pkg.name}
                            </h4>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: '#ECFDF5',
                                color: '#065F46',
                              }}
                            >
                              {pkg.badge_title ?? pkg.badgeTitle ?? 'Member'}
                            </span>
                          </div>

                          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#059669', margin: '6px 0 4px' }}>
                            ${price}{' '}
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                              / {duration >= 999 ? 'Lifetime' : `${duration} mo`}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginBottom: 12 }}>
                            {credits} Contact Credits • {views >= 9000 ? 'Unlimited' : views} Daily Views
                          </div>

                          {/* Features list */}
                          <ul style={{ margin: '0 0 16px 0', padding: '0 0 0 16px', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                            {(pkg.features || pkg.featuresJson || []).slice(0, 4).map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        {!isFree ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaymentItem({
                                type: 'MEMBERSHIP_SUBSCRIPTION',
                                packageId: pkg.id,
                                title: pkg.name,
                                price,
                                credits,
                                durationMonths: duration,
                                badgeTitle: pkg.badge_title ?? pkg.badgeTitle,
                              });
                              setPaymentModalOpen(true);
                            }}
                            className="btn-3d"
                            style={{ width: '100%', padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <CreditCard size={14} /> Select Plan (${price})
                          </button>
                        ) : (
                          <div
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              borderRadius: 8,
                              background: '#E2E8F0',
                              color: '#64748B',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            Standard Tier
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Checkout Modal (Stripe & PayPal) */}
      <MemberPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        userId={session.userId}
        userEmail={session.email}
        userProfile={myProfile}
        item={activePaymentItem}
        onSuccess={(addedCredits, newTier) => {
          setBalance((prev) => prev + addedCredits);
          if (newTier) {
            setCurrentTier(newTier);
          }
          setSyncToast(`✓ Payment successful! Granted ${addedCredits} contact credits.`);
          setTimeout(() => setSyncToast(null), 4500);
        }}
      />
    </div>
  );
}
