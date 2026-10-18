import Link from 'next/link';
import { DomainRepository } from '@/db/repository';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { PricingSection } from '@/components/home/PricingSection';
import { Crown, Check, ShieldCheck, PhoneCall, ArrowRight } from 'lucide-react';

export default function MembershipPlanPage() {
  const packages = DomainRepository.getPackages();

  const comparisonRows = [
    { feature: 'Create & Publish Marriage Profile', free: 'FREE', silver: 'Included', gold: 'Included', platinum: 'Included', elite: 'Concierge Managed' },
    { feature: 'Upload Up to 5 Photos & Purdah Shield', free: 'FREE', silver: 'Included', gold: 'Included', platinum: 'Included', elite: 'Included' },
    { feature: 'Search & Filter Profiles', free: 'FREE', silver: 'Included', gold: 'Included', platinum: 'Included', elite: 'Priority Access' },
    { feature: 'Express & Accept Interest (Salaam)', free: 'FREE', silver: 'Unlimited', gold: 'Unlimited', platinum: 'Unlimited', elite: 'Unlimited' },
    { feature: 'Verified Direct & Wali Contact Unlocks', free: '0 Unlocks', silver: '25 Unlocks', gold: '60 Unlocks', platinum: '120 Unlocks', elite: 'Unlimited VIP' },
    { feature: 'Membership Duration', free: '6 Months', silver: '3 Months', gold: '6 Months', platinum: '12 Months', elite: '24 Months' },
    { feature: 'Profile Boost & Featured Spotlight', free: '—', silver: 'Standard', gold: 'Featured Badge', platinum: 'Top Spotlight', elite: 'VIP Executive Ribbon' },
    { feature: 'Dedicated Marriage Counselor Support', free: 'Email Support', silver: 'Priority Desk', gold: 'Dedicated Advisor', platinum: 'Senior Matchmaker', elite: '1-on-1 Personal Matchmaker' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.9) 100%), url("https://marriagemediausa.com/design/admin_panel/slider_images/wedding-1556963483.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            <Crown size={13} /> Official MarriageMediaUSA.com Membership Plans
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              margin: '0 0 12px',
              fontFamily: 'var(--font-display)',
              textShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            Membership Plan & Benefits
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Start with our 19-Feature Free Membership Plan or upgrade to unlock direct Wali contact details and personalized matchmaking assistance.
          </p>
        </div>
      </section>

      {/* Main 3D Pricing Cards & 19 Free Membership Benefits */}
      <PricingSection packages={packages} />

      {/* Side-by-Side Comparison Matrix */}
      <section style={{ paddingBlock: 'var(--space-3xl)', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2
              style={{
                fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              Compare All <span style={{ color: '#c0392b' }}>Membership Tiers</span>
            </h2>
            <img
              src="/images/w-title-b.png"
              alt="Divider"
              className="ornamental-divider"
            />
          </div>

          <div className="card-3d" style={{ overflowX: 'auto', padding: 'var(--space-lg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760, fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #064E3B, #047857)', color: '#FFFFFF' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Matrimonial Feature</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Free ($0)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Silver ($2,000)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', background: '#c0392b' }}>Gold ($3,000)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Platinum ($4,000)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', borderRadius: '0 10px 0 0', background: '#B45309' }}>US Elite ($6,500)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    style={{
                      background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-main)' }}>{row.feature}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>{row.free}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{row.silver}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#c0392b', background: 'rgba(254,226,226,0.35)' }}>{row.gold}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{row.platinum}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#B45309', background: 'rgba(254,243,199,0.4)' }}>{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
