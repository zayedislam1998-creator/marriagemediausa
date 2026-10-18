import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export function UsDiasporaSpotlight() {
  const hubs = [
    {
      region: 'New York & Tri-State Area',
      states: 'NY, NJ, CT',
      cities: 'Brooklyn, Queens, Edison, Long Island, Paterson',
      count: '3,840+ Suitors',
      icon: '🗽',
      highlight: 'US Citizens & Financial / Tech Professionals',
    },
    {
      region: 'Texas Halal Hub',
      states: 'TX',
      cities: 'Dallas-Fort Worth, Houston, Austin, Plano, Frisco',
      count: '3,120+ Suitors',
      icon: '🤠',
      highlight: 'Engineers, Physicians, Tech & Vibrant Communities',
    },
    {
      region: 'California & Silicon Valley',
      states: 'CA',
      cities: 'San Jose, San Francisco, Orange County, Los Angeles, Irvine',
      count: '2,950+ Suitors',
      icon: '🌴',
      highlight: 'AI Engineers, Biotech Researchers & Entrepreneurs',
    },
    {
      region: 'Chicago & Midwest Corridor',
      states: 'IL, MI, OH',
      cities: 'Chicago, Naperville, Schaumburg, Detroit, Dearborn',
      count: '2,410+ Suitors',
      icon: '🏙️',
      highlight: 'Established Muslim Communities & Academics',
    },
    {
      region: 'DMV Capital Region',
      states: 'VA, MD, DC',
      cities: 'Fairfax, Sterling, Baltimore, Washington DC, Rockville',
      count: '1,890+ Suitors',
      icon: '🏛️',
      highlight: 'Federal Professionals, Legal & Public Policy',
    },
    {
      region: 'Bangladesh & Global Diaspora',
      states: 'Dhaka, Chittagong, Sylhet, UK & Canada',
      cities: 'Dhaka, Chittagong, Sylhet, London, Toronto',
      count: '5,200+ Suitors',
      icon: '🌍',
      highlight: 'Verified Bangladeshi & International Families',
    },
  ];

  return (
    <section
      id="us-diaspora"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-sapphire" style={{ marginBottom: 8 }}>
            <MapPin size={12} />
            United States & Global Muslim Matrimonial Network
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
            Regional <span style={{ color: '#c0392b' }}>Matrimonial Hubs</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 640, margin: '0 auto' }}>
            Connecting verified practicing Muslims across all 50 US states, Bangladesh (Dhaka, Chittagong, Sylhet), UK, and Canada.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 6 Regional Hubs (Horizontal Touch-Swipe on Mobile, 3-Col Grid on Desktop) */}
        <div className="mobile-horizontal-scroll">
          {hubs.map((hub) => (
            <div
              key={hub.region}
              className="card-3d"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
                borderTop: '4px solid #0284C7',
                padding: '1.25rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                      border: '1px solid #BFDBFE',
                      boxShadow: '0 2px 0 #93C5FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    {hub.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
                      {hub.region}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {hub.states}
                    </span>
                  </div>
                </div>
                <span className="badge badge-sapphire" style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', flexShrink: 0 }}>
                  {hub.count}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-body)', marginTop: 4, lineHeight: 1.35 }}>
                <strong>Key Cities:</strong> {hub.cities}
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  padding: '7px 10px',
                  borderRadius: 9,
                  fontSize: '0.75rem',
                  color: '#065F46',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                ✨ {hub.highlight}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <Link
                  href="/search"
                  className="btn-3d-emerald"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  Explore Profiles <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
