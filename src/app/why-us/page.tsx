import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { WhyHalalGrid } from '@/components/home/WhyHalalGrid';
import { ShieldCheck, Users, Award, Globe } from 'lucide-react';

// Real Specialist Team Members scraped directly from https://marriagemediausa.com/about
const SPECIALIST_TEAM_MEMBERS = [
  {
    name: 'Md. Alamgir H. Sarkar',
    role: 'Founder & CEO',
    photo: 'https://marriagemediausa.com/design/img/alamgir.png',
    bio: 'Md. Alamgir H. Sarkar is the Founder and Chief Executive Officer of MarriageMediaUSA.com. He holds a Bachelor of Science in Computer Science & Engineering and an MBA, leading the platform’s global matrimonial vision across the USA, Bangladesh, and worldwide.',
  },
  {
    name: 'Md. Aminul Islam Sarker',
    role: 'Chief Advisor',
    photo: 'https://marriagemediausa.com/design/img/aminul.jpg',
    bio: 'Md. Aminul Islam Sarker serves as Chief Advisor to MarriageMediaUSA.com, guiding family ethics, community outreach, and authentic Islamic matrimonial standards.',
  },
  {
    name: 'Nasima Akhter',
    role: 'Director (Admin & Finance)',
    photo: 'https://marriagemediausa.com/design/img/nasima.jpg',
    bio: 'Nasima Akhter oversees Administration, Financial Operations, and Family Support Services at MarriageMediaUSA.com, ensuring trustworthy service delivery.',
  },
  {
    name: 'Rubaiyat Tabassum Alam',
    role: 'Representative of Michigan, USA',
    photo: 'https://marriagemediausa.com/design/img/rubaiyat.jpg',
    bio: 'Rubaiyat Tabassum Alam serves as the dedicated Marriage Media USA Regional Representative in Michigan, USA, assisting North American Muslim families with verified matchmaking.',
  },
  {
    name: 'Shahida Akter Ruma',
    role: 'Senior Executive (Customer Support)',
    photo: 'https://marriagemediausa.com/design/img/ruma.jpg',
    bio: 'Shahida Akter Ruma leads Member Profile Validation, 10-Level KYC Verification, and dedicated family customer care.',
  },
  {
    name: 'Md. Asif Iqbal',
    role: 'Digital Marketing Specialist',
    photo: 'https://marriagemediausa.com/design/img/asif.jpg',
    bio: 'Md. Asif Iqbal manages global community awareness campaigns and diaspora digital outreach for MarriageMediaUSA.com.',
  },
  {
    name: 'Nazmul Haque',
    role: 'Software Engineer',
    photo: 'https://marriagemediausa.com/design/img/nazmul.jpg',
    bio: 'Nazmul Haque engineers platform security, database reliability, and high-speed matchmaking infrastructure.',
  },
  {
    name: 'Toriqul Pavel',
    role: 'Web Developer',
    photo: 'https://marriagemediausa.com/design/img/pavel.jpg',
    bio: 'Toriqul Pavel focuses on responsive user experience, profile tools, and member interface enhancements.',
  },
];

export default function WhyUsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Page Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.9) 100%), url("https://marriagemediausa.com/design/admin_panel/slider_images/Bride.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            <ShieldCheck size={13} /> About MarriageMediaUSA.com & Why Choose Us
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
            Why Marriage Media USA & Our Specialist Team
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Marriage Media USA is a fast-growing global Muslim matrimonial platform dedicated to helping single brothers, sisters, and parents find pious, verified life partners.
          </p>
        </div>
      </section>

      {/* About Marriage Media USA Story Card from https://marriagemediausa.com/about & /whyus */}
      <section style={{ paddingBlock: 'var(--space-3xl)', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div className="card-3d" style={{ padding: 'var(--space-2xl)', borderTop: '5px solid #059669' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-2xl)', alignItems: 'center' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: 8 }}>
                  Our Mission & Vision
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>
                  Welcome to <span style={{ color: '#c0392b' }}>MarriageMediaUSA.com</span>
                </h2>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-body)', lineHeight: 1.75, marginBottom: 12 }}>
                  Marriage (Nikkah) in Islam is a sacred covenant uniting not just two individuals, but two families in love, mercy, and mutual righteousness. MarriageMediaUSA.com was founded to replace unverified, informal matchmaking with a trusted, technologically advanced, and 100% Halal matrimonial network.
                </p>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-body)', lineHeight: 1.75, margin: 0 }}>
                  Whether you are searching for a practicing bride or groom in Bangladesh (Dhaka, Chittagong, Sylhet) or across the global diaspora (United States, UK, Canada, Australia, Middle East), our 10-Level Profile Verification System and specialist counselors are here to serve your family.
                </p>
              </div>
              <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 14px 32px rgba(15,23,42,0.18)', border: '4px solid #FFFFFF' }}>
                <img
                  src="https://marriagemediausa.com/design/admin_panel/slider_images/Marriage_Muslim.jpg"
                  alt="Marriage Media USA Matrimony"
                  style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Halal Grid & 10-Point Verification */}
      <WhyHalalGrid />

      {/* Real Specialist Team Members Section from https://marriagemediausa.com/about */}
      <section style={{ paddingBlock: 'var(--space-3xl)', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
            <span className="badge badge-sapphire" style={{ marginBottom: 8 }}>
              <Users size={13} /> Leadership & Matchmaking Specialists
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              Our Specialist <span style={{ color: '#c0392b' }}>Team Members</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 640, margin: '6px auto 0' }}>
              Meet the dedicated leadership, US regional representatives, and verification specialists behind MarriageMediaUSA.com.
            </p>
            <img
              src="/images/w-title-b.png"
              alt="Divider"
              className="ornamental-divider"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
              gap: 'var(--space-lg)',
            }}
          >
            {SPECIALIST_TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="card-3d"
                style={{
                  padding: 'var(--space-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderTop: '4px solid #059669',
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #10B981',
                    boxShadow: '0 8px 20px rgba(15,23,42,0.16)',
                    marginBottom: 14,
                    background: '#F1F5F9',
                  }}
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px' }}>
                  {member.name}
                </h3>
                <span className="badge badge-emerald" style={{ marginBottom: 10 }}>
                  {member.role}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
