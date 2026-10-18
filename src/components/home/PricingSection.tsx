'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Crown, ShieldCheck, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { Package } from '@/db/repository';
import { getFirestorePackages } from '@/lib/firebase/firestoreService';

interface PricingSectionProps {
  packages: Package[];
}

const FREE_MEMBERSHIP_BENEFITS = [
  'Search and view Marriage Profile',
  'Publish your Marriage Profile on Marriage Media USA',
  'Add Photo (Up to 5 Photos)',
  'Manage Privacy Settings for Photo & Profile',
  'Edit / Update your Marriage Profile',
  'Specify Preferences for Desired Partner',
  'Receive Notifications of Matching Profiles via Email',
  'Express Interest in other Members',
  'Receive Interest from other Members',
  'Accept / Decline Interest received from other Members',
  'Send Private Message to other Members (Conditions apply)',
  'Receive Private Message from other Members',
  'Respond to Private Message received',
  'View your Profile Visitors',
  'View Members who added you to their Favorite List',
  'Add Members to your Favorite List',
  'Block / Unblock or Report Members',
  'Add Video in Your Profile',
  'Upload Identity Documents to Get Profile Verified',
];

export function PricingSection({ packages }: PricingSectionProps) {
  const [displayPackages, setDisplayPackages] = useState<any[]>(packages);
  const [showAllFreeFeatures, setShowAllFreeFeatures] = useState(false);

  useEffect(() => {
    getFirestorePackages()
      .then((fbPkgs) => {
        if (fbPkgs && fbPkgs.length > 0) {
          const activePkgs = fbPkgs.filter((p) => p.isActive);
          if (activePkgs.length > 0) {
            const mapped = activePkgs.map((p, idx) => ({
              id: p.id.startsWith('pkg_') ? p.id.replace('pkg_', '') : idx + 1,
              name: p.name,
              duration_months: p.durationMonths,
              durationMonths: p.durationMonths,
              price_usd: p.priceUsd,
              priceUsd: p.priceUsd,
              contact_credits: p.contactCredits,
              contactCredits: p.contactCredits,
              daily_profile_view_limit: p.dailyProfileViewLimit,
              dailyProfileViewLimit: p.dailyProfileViewLimit,
              features: p.features,
              featuresJson: p.features,
              badge_title: p.badgeTitle,
              badgeTitle: p.badgeTitle,
              is_active: p.isActive,
            }));
            setDisplayPackages(mapped);
          }
        }
      })
      .catch(() => {
        // Keep initial packages
      });
  }, []);

  return (
    <section
      id="pricing"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #F0FDF4 100%)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingInline: 'var(--space-lg)',
        }}
      >
        {/* Section Header */}
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-gold" style={{ marginBottom: 8, boxShadow: '0 4px 10px rgba(217,119,6,0.15)' }}>
            <Crown size={13} />
            Authentic MarriageMediaUSA.com Membership Plans
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              marginBottom: 4,
              fontFamily: 'var(--font-display)',
            }}
          >
            Membership <span style={{ color: '#c0392b' }}>Plans</span> & Packages
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 680, margin: '0 auto' }}>
            Transparent membership plans from Free Registration to Dedicated US Marriage Counselor Concierge.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 3D Pricing Cards Grid (Swipe on Mobile, Multi-Col on Desktop) */}
        <div className="mobile-horizontal-scroll" style={{ alignItems: 'stretch', marginBottom: 'var(--space-3xl)' }}>
          {displayPackages.map((pkg) => {
            const isGold = (pkg.name || '').toLowerCase().includes('gold');
            const isElite = (pkg.name || '').toLowerCase().includes('elite') || (pkg.name || '').toLowerCase().includes('concierge');
            const isFree = (pkg.price_usd ?? pkg.priceUsd ?? 0) === 0;

            return (
              <div
                key={pkg.id}
                className={isElite ? 'card-3d-gold' : isGold ? 'card-3d-rose' : 'card-3d'}
                style={{
                  padding: 'var(--space-xl) var(--space-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderTop: isElite
                    ? '5px solid #D97706'
                    : isGold
                    ? '5px solid #e74c3c'
                    : '5px solid #059669',
                }}
              >
                {(isGold || isElite) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -13,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: isElite
                        ? 'linear-gradient(135deg, #F59E0B, #B45309)'
                        : 'linear-gradient(135deg, #ff5e4d, #c0392b)',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-pill)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isElite ? '👑 Executive VIP' : '🔥 Most Popular'}
                  </div>
                )}

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div
                    className={`badge ${isElite ? 'badge-gold' : isGold ? 'badge-coral' : 'badge-emerald'}`}
                    style={{ marginBottom: 8 }}
                  >
                    {pkg.badge_title}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                    {pkg.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                    Duration: {(pkg.duration_months ?? pkg.durationMonths ?? 1) > 100 ? 'Lifetime Validity' : `${pkg.duration_months ?? pkg.durationMonths ?? 1} Months`}
                  </div>
                </div>

                {/* 3D Shaded Price Box */}
                <div
                  style={{
                    marginBottom: 'var(--space-md)',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: isElite
                      ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'
                      : isGold
                      ? 'linear-gradient(135deg, #FFF1F2, #FFE4E6)'
                      : 'linear-gradient(135deg, #F8FAFC, #F0FDF4)',
                    border: '1px solid rgba(15,23,42,0.08)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.9), 0 3px 8px rgba(15,23,42,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      ${Number(pkg.price_usd ?? pkg.priceUsd ?? 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>USD</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: isElite ? '#B45309' : isGold ? '#c0392b' : '#047857',
                      fontWeight: 800,
                      marginTop: 2,
                    }}
                  >
                    {(pkg.contact_credits ?? pkg.contactCredits ?? 0) >= 9000
                      ? '⚡ Unlimited Contact Unlocks'
                      : (pkg.contact_credits ?? pkg.contactCredits ?? 0) > 0
                      ? `✨ ${pkg.contact_credits ?? pkg.contactCredits ?? 0} Verified Contact Unlocks`
                      : '🎁 19+ Free Matrimonial Features'}
                  </div>
                </div>

                {/* Feature Bullet List */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 var(--space-lg) 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 9,
                    flex: 1,
                  }}
                >
                  {(Array.isArray(pkg.features) ? pkg.features : (pkg.featuresJson || [])).map((f: string, i: number) => (
                    <li
                      key={i}
                      className={i >= 3 ? 'pricing-feature-desktop-only' : ''}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-body)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#D1FAE5',
                          color: '#059669',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Package 3D CTA */}
                <Link
                  href={isFree ? '/register' : '/membership-plan'}
                  className={
                    isElite
                      ? 'btn-3d-gold'
                      : isGold
                      ? 'btn-3d-crimson'
                      : 'btn-3d-emerald'
                  }
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {isFree ? 'Register Free Now' : `Select ${pkg.name}`} <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Real MarriageMediaUSA.com Free Membership Benefits Table */}
        <div
          className="card-3d"
          style={{
            padding: 'var(--space-2xl)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 'var(--space-lg)',
              paddingBottom: 'var(--space-md)',
              borderBottom: '2px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #10B981, #047857)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 0 #064E3B, 0 8px 16px rgba(5,150,105,0.25)',
                }}
              >
                <Gift size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  Marriage Media USA Free Membership Plan — 19 Included Features
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Every registered member on MarriageMediaUSA.com enjoys these 19 authentic matchmaking features at $0 cost:
                </p>
              </div>
            </div>
            <Link
              href="/membership-plan"
              className="btn-3d-crimson"
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                fontSize: '0.8125rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              View Full Membership Plan Details <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 10,
            }}
          >
            {FREE_MEMBERSHIP_BENEFITS.map((benefit, idx) => (
              <div
                key={benefit}
                className={!showAllFreeFeatures && idx >= 4 ? 'free-benefit-mobile-hidden' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 0 #CBD5E1, 0 4px 8px rgba(15,23,42,0.03)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={15} color="#059669" strokeWidth={3} />
                  {benefit}
                </span>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#047857',
                    fontWeight: 800,
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid #86EFAC',
                  }}
                >
                  FREE
                </span>
              </div>
            ))}
          </div>

          {/* Mobile Collapsible Toggle */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setShowAllFreeFeatures((prev) => !prev)}
              className="btn btn-ghost btn-sm"
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#059669',
                background: '#f0fdf4',
                border: '1.5px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              {showAllFreeFeatures
                ? 'Show Fewer Features ↑'
                : `+ View All 19 Free Features (${FREE_MEMBERSHIP_BENEFITS.length - 4} More) ↓`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
