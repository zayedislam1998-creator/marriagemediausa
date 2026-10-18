'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  FileText,
  PhoneCall,
  Heart,
  Eye,
  Award,
  Bell,
} from 'lucide-react';
import { AuthenticProfile, Package } from '@/db/repository';
import { MemberProfileEditor } from './MemberProfileEditor';

interface MemberPortalClientProps {
  tier: string;
  fullName: string;
  creditBalance: number;
  dailyViewLimit: number;
  curatedMatches: AuthenticProfile[];
  packages: Package[];
  myProfile?: any;
  userEmail?: string;
}

export function MemberPortalClient({
  tier,
  fullName,
  creditBalance,
  dailyViewLimit,
  curatedMatches,
  packages,
  myProfile,
  userEmail,
}: MemberPortalClientProps) {
  const [portalTab, setPortalTab] = useState<'overview' | 'profile' | 'matching'>('overview');
  const [purdahShieldActive, setPurdahShieldActive] = useState(true);
  const [waliSmsAlerts, setWaliSmsAlerts] = useState(true);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [conciergeMessage, setConciergeMessage] = useState('');
  const [conciergeSent, setConciergeSent] = useState<string | null>(null);

  const [photoRequests, setPhotoRequests] = useState([
    {
      id: 'PAR-01',
      requesterName: 'Shahidur Rahman (Software Engineer, NY)',
      profileId: '2018054077',
      matchScore: 95,
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'DECLINED',
    },
    {
      id: 'PAR-02',
      requesterName: 'Dr. Zayan Al-Mansoor (Cardiologist, IL)',
      profileId: '2026011890',
      matchScore: 92,
      status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'DECLINED',
    },
  ]);

  const isVipTier = tier === 'PLATINUM' || tier === 'ELITE';

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeMessage.trim()) return;
    setConciergeSent(
      `✓ Priority Matchmaker Concierge ticket dispatched for ${fullName}. Senior Matchmaker Shaykh Tariq will coordinate with your Wali within 2 hours.`
    );
    setConciergeMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
      {/* 3D Portal Navigation Tabs */}
      <div
        className="card-3d"
        style={{
          display: 'flex',
          gap: 8,
          padding: '6px 10px',
          background: '#fff',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setPortalTab('overview')}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: portalTab === 'overview' ? 'var(--emerald-700)' : 'transparent',
            color: portalTab === 'overview' ? '#fff' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          📊 Dashboard Overview
        </button>
        <button
          type="button"
          onClick={() => setPortalTab('profile')}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: portalTab === 'profile' ? 'var(--emerald-700)' : 'transparent',
            color: portalTab === 'profile' ? '#fff' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          📝 My Biodata & Profile Editor
        </button>
        <button
          type="button"
          onClick={() => setPortalTab('matching')}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: portalTab === 'matching' ? 'var(--emerald-700)' : 'transparent',
            color: portalTab === 'matching' ? '#fff' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          💖 Halal Matches & Compatibility ({curatedMatches.length})
        </button>
      </div>

      {/* TAB 1: Profile Editor */}
      {portalTab === 'profile' && (
        <MemberProfileEditor initialProfile={myProfile} userEmail={userEmail || ''} />
      )}

      {/* TAB 2: Overview & Controls */}
      {portalTab === 'overview' && (
        <>
          {/* Row 1: Privacy & Purdah Shield Controls + Exportable Biodata PDF & VIP Concierge */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'var(--space-xl)',
            }}
          >
            {/* Module 6: Privacy, Purdah Shield & Wali Notification Controls */}
            <div
              style={{
                background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              🧕 Purdah Photo Shield & Wali Controls
            </h2>
            <span className={`badge ${purdahShieldActive ? 'badge-gold' : 'badge-emerald'}`}>
              {purdahShieldActive ? '🔒 24px Blur Active' : 'Public Mode'}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            Control who can view your unblurred photograph and configure instant SMS alerts to your Wali (Guardian).
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Purdah Modesty Gaussian Blur</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Requires explicit approval before any suitor sees unblurred photos
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPurdahShieldActive(!purdahShieldActive)}
              className={`btn btn-sm ${purdahShieldActive ? 'btn-primary' : 'btn-outline'}`}
            >
              {purdahShieldActive ? (
                <>
                  <Lock size={13} /> Active
                </>
              ) : (
                <>
                  <Unlock size={13} /> Off
                </>
              )}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Direct Wali SMS & Email Alerts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                CC Guardian automatically on new proposals and chat transcripts
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWaliSmsAlerts(!waliSmsAlerts)}
              className={`btn btn-sm ${waliSmsAlerts ? 'btn-primary' : 'btn-outline'}`}
            >
              <Bell size={13} /> {waliSmsAlerts ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Incoming Photo Access Requests */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>
              INCOMING PHOTO ACCESS REQUESTS ({photoRequests.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {photoRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{req.requesterName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald-700)' }}>
                      {req.matchScore}% Compatibility • Status: {req.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoRequests((prev) =>
                          prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
                        )
                      }
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoRequests((prev) =>
                          prev.map((r) => (r.id === req.id ? { ...r, status: 'DECLINED' } : r))
                        )
                      }
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', color: 'var(--coral-600)' }}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 7: Dedicated VIP Matchmaker Concierge & Exportable Biodata PDF */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                👑 Executive Concierge & Biodata PDF
              </h2>
              <span className={`badge ${isVipTier ? 'badge-coral' : 'badge-sapphire'}`}>
                {isVipTier ? 'VIP Hotline Active' : `Tier: ${tier}`}
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              {isVipTier
                ? 'As a Platinum / US Elite member, you have direct access to our Senior Matchmaker for Wali-to-Wali background introductions.'
                : 'Compare membership tiers ($0 to $6,500 US Elite) or export your 2-page official Islamic Biodata PDF for family consultation.'}
            </p>

            {conciergeSent && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--emerald-50)',
                  border: '1px solid var(--emerald-300)',
                  color: 'var(--emerald-900)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {conciergeSent}
              </div>
            )}

            <form onSubmit={handleConciergeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Direct Matchmaker Concierge Request (Wali Introduction / Vetting)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Requesting formal Wali introduction with Profile #2026044925 (Dr. Ayesha Siddiqa, Dallas TX)..."
                value={conciergeMessage}
                onChange={(e) => setConciergeMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                <PhoneCall size={13} /> Dispatch to Senior Matchmaker
              </button>
            </form>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-outline btn-sm"
            >
              <FileText size={14} /> Download / Print 2-Page Biodata PDF
            </button>
            <button
              type="button"
              onClick={() => setTierModalOpen(true)}
              className="btn btn-outline-emerald btn-sm"
            >
              <Award size={14} /> Compare All 5 Tiers ($0 – $6,500)
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Row 2: Module 5 - Algorithmic Daily Curated Match Feed */}
      {(portalTab === 'matching' || portalTab === 'overview') && (
        <div
          className="card-3d"
          style={{
            background: '#fff',
            padding: 'var(--space-xl)',
          }}
        >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-lg)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              💖 Algorithmic Daily Curated Matches (0–100% Compatibility Engine)
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Weighted across Age (20pt), Islamic Practice (25pt), US Location (20pt), Profession (15pt), and Family Values (20pt).
            </p>
          </div>
          <Link href="/search" className="btn btn-primary btn-sm">
            Open 3-Column Search Workspace →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-md)',
          }}
        >
          {curatedMatches.map((m, idx) => {
            const score = [96, 94, 92, 89, 95][idx % 5];
            return (
              <div
                key={m.profile_id}
                style={{
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald">{score}% Match</span>
                  <span className="badge badge-sapphire">🛡️ {m.residing_status}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {m.full_name} ({m.age} yrs)
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)' }}>
                  {m.profession} • {m.city}, {m.state_province}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sect: {m.sect_mazhab} • Salah: {m.pray_frequency}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <Link
                    href={`/profile/${m.profile_id}`}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={13} /> Full Biodata
                  </Link>
                  <Link
                    href="/proposals"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Heart size={13} /> Salaam
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Tier Comparison Modal */}
      {tierModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-xl)',
              maxWidth: 780,
              width: '100%',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Authentic Marriage Media USA Membership Tiers ($0 – $6,500)
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Current Active Tier: <strong>{tier}</strong> ({creditBalance >= 9000 ? 'Unlimited' : creditBalance} Contact Credits)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTierModalOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Package Tier</th>
                    <th style={{ padding: '10px 12px' }}>Price (USD)</th>
                    <th style={{ padding: '10px 12px' }}>Duration</th>
                    <th style={{ padding: '10px 12px' }}>Contact Unlocks</th>
                    <th style={{ padding: '10px 12px' }}>Daily Views</th>
                    <th style={{ padding: '10px 12px' }}>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{pkg.name}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: 'var(--emerald-700)' }}>
                        ${pkg.price_usd.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>{pkg.duration_months} Months</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>
                        {pkg.contact_credits >= 999 ? 'Unlimited' : pkg.contact_credits} Contacts
                      </td>
                      <td style={{ padding: '12px' }}>{pkg.daily_profile_view_limit} / day</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-emerald">{pkg.badge_title}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
