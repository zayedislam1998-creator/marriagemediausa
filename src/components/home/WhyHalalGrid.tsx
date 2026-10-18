import Link from 'next/link';
import { ShieldCheck, UserCheck, EyeOff, FileText, Heart, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export function WhyHalalGrid() {
  const pillars = [
    {
      title: '10-Level Profile Verification System',
      desc: 'Marriage Media USA verifies 10 vital credentials: Identity, Citizenship, Age, Education, Profession, Marital Status, Religion, Address, Mobile, and Email.',
      icon: ShieldCheck,
      gradient: 'linear-gradient(135deg, #10B981, #047857)',
      shadow: '#064E3B',
    },
    {
      title: 'Mandatory Wali (Guardian) Involvement',
      desc: 'All female biodatas include verified Father or Legal Guardian oversight, preserving Islamic family honor and authentic Sunnah marriage.',
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #F59E0B, #B45309)',
      shadow: '#78350F',
    },
    {
      title: 'Purdah Photo Modesty & Privacy Shield',
      desc: 'Complete control over your photographs. Restrict photo visibility to approved suitors or enable Purdah privacy shields at any time.',
      icon: EyeOff,
      gradient: 'linear-gradient(135deg, #ff5e4d, #c0392b)',
      shadow: '#7f1d1d',
    },
    {
      title: 'National ID, Passport & SSN Verification',
      desc: 'Government-issued Passports, National ID Cards, Driving Licenses, and academic certificates are manually reviewed by our verification desk.',
      icon: FileText,
      gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      shadow: '#1E3A8A',
    },
    {
      title: '100% Genuine Matrimonial Profiles',
      desc: 'Strictly for marriage (Nikkah)—never casual dating. Every registered profile is screened for authenticity and serious family intent.',
      icon: Heart,
      gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      shadow: '#4C1D95',
    },
    {
      title: 'Dedicated Marriage Counselor Support',
      desc: 'Our specialist matchmaking team and regional representatives assist families personally from biodata shortlisting to Nikkah.',
      icon: Award,
      gradient: 'linear-gradient(135deg, #059669, #065F46)',
      shadow: '#022C22',
    },
  ];

  const verificationBadges = [
    '1. Identity (Passport / National ID / Driving License)',
    '2. Citizenship / Nationality Document',
    '3. Age Verification (Birth Certificate / Passport)',
    '4. Educational Qualification Certificates',
    '5. Profession & Employment ID Card',
    '6. Marital Status Legal Proof',
    '7. Religion Declaration',
    '8. Permanent & Present Address Proof',
    '9. Mobile Number OTP Verification',
    '10. Official Email Address Verification',
  ];

  return (
    <section
      id="why-us"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%)',
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
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-emerald" style={{ marginBottom: 8 }}>
            <ShieldCheck size={12} />
            Why Choose MarriageMediaUSA.com
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
            Why Families Trust <span style={{ color: '#c0392b' }}>Marriage Media USA</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 660, margin: '0 auto' }}>
            Marriage Media USA is a fast-growing global matrimonial service built to help Muslim families find righteous life partners with complete trust, security, and Islamic dignity.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 6 Halal Pillars (Native List on Mobile, 3-Col Grid on Desktop) */}
        <div className="mobile-pillar-list" style={{ marginBottom: 'var(--space-2xl)' }}>
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="card-3d mobile-pillar-card"
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                  padding: '1.25rem 1.15rem',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: pillar.gradient,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 3px 0 ${pillar.shadow}`,
                  }}
                >
                  <Icon size={19} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 900,
                      color: 'var(--text-main)',
                      marginBottom: 3,
                      marginTop: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mobile-pillar-desc" style={{ fontSize: '0.75rem', color: 'var(--text-body)', lineHeight: 1.45, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 10-Point Verification Strip from marriagemediausa.com/Welcome2/verify_profile */}
        <div
          className="card-3d-gold"
          style={{
            padding: '1.25rem 1.15rem',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 60%, #F0FDF4 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: '1rem',
            }}
          >
            <div>
              <span className="badge badge-gold" style={{ marginBottom: 6 }}>
                Official Marriage Media USA Verification Standard
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                10-Point Profile Verification Checklist
              </h3>
            </div>
            <Link
              href="/why-us"
              className="btn-3d-gold"
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                fontSize: '0.76rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              Learn About Verification <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mobile-2col-grid" style={{ gap: 6 }}>
            {verificationBadges.map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 9px',
                  borderRadius: 9,
                  background: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  boxShadow: '0 1px 0 #FCD34D',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#78350F',
                }}
              >
                <CheckCircle2 size={13} color="#059669" style={{ flexShrink: 0 }} />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
