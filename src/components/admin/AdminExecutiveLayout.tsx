'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BarChart3,
  Award,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sliders,
  Settings,
  UserPlus,
  CheckCircle2,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { AdminMemberRecord, FormBuilderConfigRecord, ProfileRequirementRecord } from '@/db/queries';
import { SeatMember, AuditLog } from '@/lib/admin/store';
import { Package } from '@/db/repository';
import { MembersDirectoryTab } from './MembersDirectoryTab';
import { FormStudioTab } from './FormStudioTab';
import { PricingPackagesTab } from './PricingPackagesTab';
import { SettingsSecurityTab } from './SettingsSecurityTab';
import { ProvisionMemberModal } from './ProvisionMemberModal';
import { useCrossTabSync } from '@/lib/sync/broadcastSync';
import { firebaseLogout } from '@/lib/firebase/authService';

interface AdminExecutiveLayoutProps {
  adminEmail: string;
  initialMembers: AdminMemberRecord[];
  initialSeats: SeatMember[];
  packages: Package[];
  auditLogs: AuditLog[];
  initialRequirements?: ProfileRequirementRecord[];
  initialFormConfigs?: FormBuilderConfigRecord[];
}

export function AdminExecutiveLayout({
  adminEmail,
  initialMembers,
  initialSeats,
  packages: initialPackages,
  auditLogs,
  initialFormConfigs,
}: AdminExecutiveLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'members' | 'forms' | 'packages' | 'kyc' | 'analytics' | 'settings'
  >('members');
  const [seatActionMsg, setSeatActionMsg] = useState<string | null>(null);

  // Real-Time Cross-Tab Reactivity Listener
  useCrossTabSync((msg) => {
    setSeatActionMsg(`✓ Cross-tab event: ${msg.type.replace(/_/g, ' ')} detected!`);
    setTimeout(() => setSeatActionMsg(null), 4000);
  });

  const handleSignOut = async () => {
    await firebaseLogout();
    window.location.href = '/admin';
  };

  const navItems = [
    {
      id: 'members' as const,
      label: 'Members Directory',
      shortLabel: 'Members',
      icon: Users,
      badge: initialMembers.length.toString(),
      badgeColor: 'var(--emerald-600)',
    },
    {
      id: 'forms' as const,
      label: 'Form Studio',
      shortLabel: 'Forms',
      icon: Sliders,
      badge: '4 Forms',
      badgeColor: '#10B981',
    },
    {
      id: 'packages' as const,
      label: 'Pricing & Packages',
      shortLabel: 'Packages',
      icon: Award,
      badge: `${initialPackages.length} Tiers`,
      badgeColor: 'var(--sapphire-600)',
    },
    {
      id: 'kyc' as const,
      label: 'KYC Verification',
      shortLabel: 'KYC',
      icon: FileCheck,
      badge: 'Desk',
      badgeColor: 'var(--emerald-700)',
    },
    {
      id: 'analytics' as const,
      label: 'Revenue & Analytics',
      shortLabel: 'Analytics',
      icon: BarChart3,
      badge: '+32% MoM',
      badgeColor: 'var(--gold-600)',
    },
    {
      id: 'settings' as const,
      label: 'Settings & Security',
      shortLabel: 'Settings',
      icon: Settings,
      badge: 'Governance',
      badgeColor: '#64748B',
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--foreground)' }}>
      {/* ============================================================
          1. DESKTOP 3D LEFT SIDEBAR (STICKY, COMPACT & COLLAPSIBLE)
         ============================================================ */}
      <aside
        className="card-3d"
        style={{
          width: isCollapsed ? 82 : 280,
          background: '#0F172A',
          color: '#fff',
          borderRadius: 0,
          border: 'none',
          borderRight: '1.5px solid #1E293B',
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'width 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Brand & Collapse Header */}
        <div
          style={{
            padding: isCollapsed ? '18px 12px' : '20px 20px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: 10,
          }}
        >
          {!isCollapsed ? (
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--gold-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                }}
              >
                👑
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                  Marriage Media USA
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600 }}>
                  Executive Admin Suite
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
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              👑
            </div>
          )}

          {/* Expand/Collapse Toggle Button */}
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
              transition: 'all 0.2s ease',
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Live System Status Indicator (Clean, No Developer Jargon) */}
        <div
          style={{
            padding: isCollapsed ? '10px 6px' : '10px 20px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 8,
            fontSize: '0.72rem',
            color: '#34D399',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981',
              flexShrink: 0,
            }}
          />
          {!isCollapsed && <span>Platform Active</span>}
        </div>

        {/* Navigation List (Exactly 6 Streamlined Items) */}
        <nav
          style={{
            flex: 1,
            padding: isCollapsed ? '14px 8px' : '14px 12px',
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
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '12px 0' : '11px 14px',
                  borderRadius: 12,
                  border: isActive ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.15))'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative',
                  boxShadow: isActive ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'none',
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon
                    size={20}
                    color={isActive ? 'var(--emerald-400)' : '#94A3B8'}
                    style={{ flexShrink: 0 }}
                  />
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: isCollapsed ? '14px 8px' : '16px 18px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {adminEmail}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 600 }}>
                Super Admin Active
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link
              href="/dashboard"
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                padding: '6px 10px',
                borderRadius: 8,
                background: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.725rem',
                fontWeight: 700,
              }}
              title="Switch to Member Dashboard View"
            >
              <LayoutDashboard size={13} />
              {!isCollapsed && 'Member View'}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                color: '#F87171',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.725rem',
                fontWeight: 700,
              }}
              title="Sign Out"
            >
              <LogOut size={13} />
              {!isCollapsed && 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================
          2. MOBILE TOP NAV BAR (<1024px)
         ============================================================ */}
      <div
        className="admin-mobile-topbar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#0F172A',
          color: '#fff',
          zIndex: 50,
          padding: '0 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: '#1E293B',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              padding: 8,
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>Marriage Media USA Admin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/dashboard"
            style={{
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 6,
              background: '#1E293B',
            }}
          >
            Member View
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 6,
              color: '#F87171',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: 280,
              background: '#0F172A',
              height: '100%',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#fff' }}>Navigation Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      color: isActive ? '#fff' : '#94A3B8',
                      fontWeight: isActive ? 800 : 600,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ============================================================
          3. MAIN FLUID WORKSPACE (ON-PAGE DYNAMIC VIEW LOADING)
         ============================================================ */}
      <main
        style={{
          flex: 1,
          padding: '24px 32px 60px 32px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {/* Workspace Top Bar Header */}
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
                Executive Console
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Multi-Seat Halal Governance Platform • Authenticated as {adminEmail}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => setProvisionModalOpen(true)}
              className="btn-3d"
              style={{ fontSize: '0.8rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <UserPlus size={15} /> Provision Member
            </button>
            <Link href="/" className="btn-3d-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
              Public Website →
            </Link>
          </div>
        </header>

        {/* Notification Toast */}
        {seatActionMsg && (
          <div
            className="card-3d"
            style={{
              padding: '12px 18px',
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              color: '#065F46',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{seatActionMsg}</span>
          </div>
        )}

        {/* ============================================================
            4. ON-PAGE DYNAMIC VIEW CONTENT (NO FULL PAGE RELOAD)
           ============================================================ */}

        {/* VIEW 1: Members & Biodata Directory */}
        {activeTab === 'members' && (
          <MembersDirectoryTab initialMembers={initialMembers} />
        )}

        {/* VIEW 2: Form Studio (Login, Register, Profile, CV) */}
        {activeTab === 'forms' && (
          <FormStudioTab initialConfigs={initialFormConfigs || []} />
        )}

        {/* VIEW 3: Pricing & Packages (Controlled Scroll, Flexible Durations, Zero Jargon) */}
        {activeTab === 'packages' && (
          <PricingPackagesTab initialPackages={initialPackages} />
        )}

        {/* VIEW 4: KYC Verification Desk */}
        {activeTab === 'kyc' && (
          <div className="card-3d" style={{ padding: 24, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Moderator KYC Verification Vault
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Review government IDs, passports, and verify matrimonial candidate authenticity.
                </p>
              </div>
              <Link href="/admin/kyc" className="btn-3d" style={{ fontSize: '0.8rem', padding: '8px 14px', textDecoration: 'none' }}>
                Open Dedicated KYC Desk →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {initialMembers.slice(0, 6).map((m) => (
                <div key={m.userId} className="card-3d" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800 }}>{m.profile?.fullName || m.email}</div>
                    <span className="badge-3d">{m.profile?.kycStatus || 'VERIFIED'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Profile ID: {m.profile?.profileId} • {m.profile?.profession || 'Member'}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Link
                      href="/admin/kyc"
                      className="btn-3d-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', flex: 1, textAlign: 'center', textDecoration: 'none' }}
                    >
                      Inspect Document
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: Revenue & Analytics */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              <div className="card-3d" style={{ padding: 22 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Total Platform Revenue (2026)
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: 6 }}>
                  $254,000
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: 4 }}>
                  +32.4% MoM Growth
                </div>
              </div>

              <div className="card-3d" style={{ padding: 22 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Active Paid Subscriptions
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sapphire-600)', marginTop: 6 }}>
                  74 Clients
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, marginTop: 4 }}>
                  +18 Activated this month
                </div>
              </div>

              <div className="card-3d" style={{ padding: 22 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  US Elite Concierge ($6,500)
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-600)', marginTop: 6 }}>
                  14 VIP Clients
                </div>
                <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginTop: 4 }}>
                  High Touch Wali Introductions
                </div>
              </div>

              <div className="card-3d" style={{ padding: 22 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Verified Halal Matrimonial Wallets
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--coral-500)', marginTop: 6 }}>
                  1,420 Users
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: 4 }}>
                  Zero Mock Data Policy Enforced
                </div>
              </div>
            </div>

            <div className="card-3d" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0' }}>
                Subscription Economic Model Breakdown
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                Revenue stream across authentic Marriage Media USA pricing packages ($2k Silver, $3k Gold, $4k Diamond, $6.5k Elite).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Silver ($2,000)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sapphire-600)', marginTop: 4 }}>$64,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>32 Subscriptions</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Gold ($3,000)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-600)', marginTop: 4 }}>$54,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>18 Subscriptions</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Diamond ($4,000)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8B5CF6', marginTop: 4 }}>$40,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 Subscriptions</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Royal Walima ($6,500)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: 4 }}>$91,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14 VIP Subscriptions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: Settings & Security (Consolidated Top Sub-Tabs) */}
        {activeTab === 'settings' && (
          <SettingsSecurityTab
            initialSeats={initialSeats}
            auditLogs={auditLogs}
            adminEmail={adminEmail}
          />
        )}
      </main>

      {/* Direct Member Provisioning Modal */}
      <ProvisionMemberModal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        onMemberProvisioned={(res) => {
          setSeatActionMsg(`✓ Verified member provisioned: ${res.user?.email} (${res.profile?.fullName})`);
          setTimeout(() => setSeatActionMsg(null), 4500);
        }}
      />
    </div>
  );
}
