import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export function StepsToNikkah() {
  const steps = [
    {
      step: 'STEP 01',
      title: 'Create a Profile (100% Free)',
      img: '/images/soul-1.png',
      cardClass: 'card-3d',
      accent: '#059669',
      description:
        'Register for FREE and complete your detailed 85+ field matrimonial profile with photo album (up to 9 photos), Purdah privacy shield, and mandatory family/Wali details.',
      bullets: [
        'Free Registration & Biodata Creation',
        '10-Level Identity & Document Screening',
        'Register for Self, Son, Daughter, or Sibling',
      ],
    },
    {
      step: 'STEP 02',
      title: 'Find Matches Worldwide',
      img: '/images/soul-2.png',
      cardClass: 'card-3d-gold',
      accent: '#d97706',
      description:
        'Use our sophisticated search by Profession, Mother Tongue, Living Country, US State/City, Profile ID, or Age—backed by our 0-100% Islamic Compatibility Algorithm.',
      bullets: [
        'Search by Profession, Language, City & Country',
        'Express Interest & Send Personalized Messages',
        'Verified Wali & Guardian Contact Transparency',
      ],
    },
    {
      step: 'STEP 03',
      title: 'Got Engaged & Blessed Nikkah',
      img: '/images/soul-3.png',
      cardClass: 'card-3d-rose',
      accent: '#e11d48',
      description:
        'Once interest is accepted, communicate in our Halal Chat Lounge, connect families and Walis directly by phone, and celebrate a blessed Sunnah marriage.',
      bullets: [
        'Direct Family & Wali Introductions',
        'In-Site Halal Messenger & Match Alerts',
        'Dedicated Marriage Counselor Assistance',
      ],
    },
  ];

  return (
    <section
      style={{
        paddingBlock: '3.75rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
        <div className="ornamental-header">
          <div className="badge badge-emerald" style={{ marginBottom: 8, padding: '5px 14px' }}>
            <Sparkles size={12} /> Dignified Islamic Matchmaking Protocol
          </div>
          <h2>
            Step to <span>Find Your Partner</span>
          </h2>
          <div className="ornamental-divider">
            <img src="/images/w-title-b.png" alt="Divider" />
          </div>
          <p style={{ color: '#475569', fontSize: '0.925rem', maxWidth: 680, margin: '0 auto' }}>
            Searching for a life partner is one of the most important tasks of life. MarriageMediaUSA.com combines
            free registration, 10-Level verification, and family oversight for a worry-free marriage journey.
          </p>
        </div>

        {/* 3-Step Process (Horizontal Swipe on Mobile, 3-Col on Desktop) */}
        <div className="mobile-horizontal-scroll">
          {steps.map((item) => (
            <div
              key={item.step}
              className={item.cardClass}
              style={{
                padding: '1.25rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Top Step Pill */}
              <div
                style={{
                  background: item.accent,
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '3px 12px',
                  borderRadius: 999,
                  letterSpacing: '0.08em',
                  marginBottom: '0.85rem',
                  boxShadow: `0 4px 10px ${item.accent}44`,
                }}
              >
                {item.step}
              </div>

              {/* 3D Soul Icon Circle from live marriagemediausa.com */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: `2px solid ${item.accent}40`,
                  boxShadow:
                    '0 12px 24px -8px rgba(15, 23, 42, 0.16), inset 0 -3px 6px rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ width: 40, height: 40, objectFit: 'contain' }}
                />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                {item.description}
              </p>

              {/* Bullet Highlights */}
              <div
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  marginTop: 'auto',
                }}
              >
                {item.bullets.map((b) => (
                  <div
                    key={b}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    <CheckCircle2 size={14} style={{ color: item.accent, flexShrink: 0 }} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom 3D Action Banner */}
        <div
          style={{
            marginTop: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <Link href="/register" className="btn-3d-emerald" style={{ fontSize: '0.95rem', padding: '13px 28px' }}>
            Create Your Free Verified Biodata <ArrowRight size={18} />
          </Link>
          <Link href="/how-it-works" className="btn-3d-gold" style={{ fontSize: '0.95rem', padding: '13px 26px' }}>
            <ShieldCheck size={18} /> Read Complete How It Works Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
