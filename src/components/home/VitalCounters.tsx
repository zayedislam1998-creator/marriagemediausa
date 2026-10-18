import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function VitalCounters() {
  const stats = [
    {
      label: 'Total Verified Members',
      shortLabel: 'Total Members',
      value: '15,420+',
      sub: 'Worldwide & US Diaspora',
      img: '/images/w-icon-1.png',
      href: '/search',
      cardClass: 'card-3d',
      accent: '#059669',
    },
    {
      label: 'Members Online Now',
      shortLabel: 'Online Now',
      value: '1,240',
      sub: 'Active Matrimonial Suitors',
      img: '/images/w-icon-2.png',
      href: '/search',
      cardClass: 'card-3d-gold',
      accent: '#d97706',
    },
    {
      label: 'Men Online (Grooms)',
      shortLabel: 'Men Online',
      value: '810',
      sub: 'Verified Practicing Brothers',
      img: '/images/w-icon-3.png',
      href: '/search?gender=MALE',
      cardClass: 'card-3d',
      accent: '#0284c7',
    },
    {
      label: 'Women Online (Brides)',
      shortLabel: 'Women Online',
      value: '430',
      sub: 'Wali-Protected Sisters',
      img: '/images/w-icon-4.png',
      href: '/search?gender=FEMALE',
      cardClass: 'card-3d-rose',
      accent: '#e11d48',
    },
  ];

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)',
        paddingTop: '2.75rem',
        paddingBottom: '3.25rem',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingInline: 'var(--space-lg)',
        }}
      >
        {/* Ornamental Welcome Title (From live marriagemediausa.com) */}
        <div className="ornamental-header">
          <h2>
            Welcome to <span>Muslim</span>Bibah
          </h2>
          <div className="ornamental-divider">
            <img src="/images/w-title-b.png" alt="Ornamental Divider" />
          </div>
          <p style={{ color: '#475569', fontSize: '0.925rem', maxWidth: 680, margin: '0 auto', fontWeight: 500 }}>
            One of the leading and most trusted matrimony sites in the world—specializing in 100% Free
            Registration, 10-Level Profile Verification, and dignified family matchmaking.
          </p>
        </div>

        {/* 4-Column 3D Counter Cards (2-Column on Mobile) */}
        <div className="mobile-2col-grid">
          {stats.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.cardClass}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {/* 3D Floating Icon Pedestal */}
              <div
                className="vital-pedestal"
                style={{
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow:
                    '0 12px 24px -6px rgba(15, 23, 42, 0.16), inset 0 -3px 6px rgba(15, 23, 42, 0.06)',
                  border: `2px solid ${item.accent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  style={{ width: '56%', height: '56%', objectFit: 'contain' }}
                />
              </div>

              <div
                className="vital-counter-val"
                style={{
                  fontWeight: 900,
                  color: item.accent,
                  lineHeight: 1.1,
                  textShadow: '0 2px 4px rgba(15,23,42,0.08)',
                }}
              >
                {item.value}
              </div>

              <div
                className="vital-counter-lbl"
                style={{ fontWeight: 800, color: '#0f172a' }}
              >
                <span className="vital-label-full">{item.label}</span>
                <span className="vital-label-short" style={{ display: 'none' }}>{item.shortLabel}</span>
              </div>

              <div
                className="vital-counter-sub"
                style={{
                  fontWeight: 700,
                  color: '#64748b',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldCheck size={13} style={{ color: item.accent }} />
                {item.sub}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
