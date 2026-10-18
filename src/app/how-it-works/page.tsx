import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { StepsToNikkah } from '@/components/home/StepsToNikkah';
import { TrustSafetyFaq } from '@/components/home/TrustSafetyFaq';
import { ShieldCheck, CheckCircle2, FileText, Lock, Scale, AlertCircle, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const tenPointChecks = [
    {
      num: '01',
      title: 'Identity Verification',
      doc: 'National ID Card, Passport, or Driving License',
      desc: 'Confirms legal full name, photograph, and government-issued identification number.',
    },
    {
      num: '02',
      title: 'Citizenship & Residency',
      doc: 'Passport, Birth Certificate, US Green Card, or Citizenship Certificate',
      desc: 'Verifies country of citizenship and legal residency status in the USA, Bangladesh, UK, or abroad.',
    },
    {
      num: '03',
      title: 'Age Verification',
      doc: 'Passport, Birth Certificate, or SSC/O-Level Certificate',
      desc: 'Ensures accurate date of birth and legal marriageable age compliance.',
    },
    {
      num: '04',
      title: 'Educational Qualification',
      doc: 'University Degree Certificates & Academic Transcripts',
      desc: 'Confirms highest academic degree, institution name, and graduation status.',
    },
    {
      num: '05',
      title: 'Profession & Employment',
      doc: 'Official Employee ID Card, Appointment Letter, or Trade License',
      desc: 'Verifies current designation, employer organization, and professional standing.',
    },
    {
      num: '06',
      title: 'Marital Status Proof',
      doc: 'Unmarried Certificate, Divorce Decree, or Death Certificate of Spouse',
      desc: 'Guarantees complete transparency regarding previous marital history.',
    },
    {
      num: '07',
      title: 'Religion & Faith',
      doc: 'Official ID or Signed Religious Declaration',
      desc: 'Confirms Islamic faith and sect/mazhab details.',
    },
    {
      num: '08',
      title: 'Present & Permanent Address',
      doc: 'Utility Bill, Bank Statement, or National ID Address',
      desc: 'Verifies physical residential address for family background authenticity.',
    },
    {
      num: '09',
      title: 'Mobile Number Verification',
      doc: 'Live SMS OTP & Direct Support Call Check',
      desc: 'Ensures the suitor and Wali guardian phone numbers are active and reachable.',
    },
    {
      num: '10',
      title: 'Email Address Verification',
      doc: 'Activation Link Verification',
      desc: 'Secures account notifications, match alerts, and official communications.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Page Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.88) 100%), url("https://marriagemediausa.com/design/admin_panel/slider_images/Marriage_Muslim.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            Official MarriageMediaUSA.com Guide
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
            How Marriage Media USA Works
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Find your righteous life partner safely through our 3-Step Matchmaking Workflow and 10-Level Profile Verification System.
          </p>
        </div>
      </section>

      {/* 3 Simple Steps Component */}
      <StepsToNikkah />

      {/* Detailed How It Works Walkthrough from marriagemediausa.com/Welcome2/how */}
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
              Complete Step-by-Step <span style={{ color: '#c0392b' }}>Matrimonial Process</span>
            </h2>
            <img
              src="/images/w-title-b.png"
              alt="Divider"
              className="ornamental-divider"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-lg)' }}>
            <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #059669' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#065F46', marginTop: 0 }}>
                Step 1: Register & Complete Your Biodata
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.65 }}>
                Create your free marriage profile for yourself, your son, daughter, sibling, or relative. Fill in accurate personal details, education, career, family background, religious practice, and desired partner preferences. Upload up to 5 photographs and configure your Purdah photo privacy settings.
              </p>
            </div>

            <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #D97706' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#92400E', marginTop: 0 }}>
                Step 2: Validate & Search Compatible Profiles
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.65 }}>
                Once our moderation team validates your profile, use our Advanced Search by Age, Country, US State, City, Profession, Mother Tongue, or Profile ID. Receive automatic email notifications when matching profiles join MarriageMediaUSA.com.
              </p>
            </div>

            <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #e74c3c' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#991B1B', marginTop: 0 }}>
                Step 3: Express Interest & Connect with Wali
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.65 }}>
                Send interest (Salaam), shortlist favorite profiles, and exchange private messages. Upgrade to Silver, Gold, Platinum, or US Elite VIP to unlock verified guardian (Wali) phone numbers and receive dedicated marriage counselor support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Level Profile Verification Section (#verify) */}
      <section
        id="verify"
        style={{
          paddingBlock: 'var(--space-3xl)',
          background: 'linear-gradient(180deg, #FDFBF7 0%, #F0FDF4 100%)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
            <span className="badge badge-emerald" style={{ marginBottom: 8 }}>
              <ShieldCheck size={13} /> Official Verification Protocol
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
              10-Level <span style={{ color: '#c0392b' }}>Profile Verification</span> System
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 680, margin: '6px auto 0' }}>
              Email your supporting documents to <strong>support@marriagemediausa.com</strong> with your Profile ID to earn Verified Badges across 10 trust categories.
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 'var(--space-lg)',
            }}
          >
            {tenPointChecks.map((item) => (
              <div key={item.num} className="card-3d" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #047857)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: 8,
                      boxShadow: '0 2px 0 #064E3B',
                    }}
                  >
                     Badge #{item.num}
                  </span>
                  <CheckCircle2 size={18} color="#059669" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', marginBottom: 6 }}>
                  Accepted Proof: {item.doc}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-body)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Governance Sections (#terms, #privacy, #disclaimer) */}
      <section style={{ paddingBlock: 'var(--space-3xl)', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', paddingInline: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div id="terms" className="card-3d" style={{ padding: 'var(--space-xl)', borderLeft: '5px solid #059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Scale size={22} color="#059669" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Terms and Conditions</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.7, margin: 0 }}>
              MarriageMediaUSA.com is strictly an Islamic matrimonial platform designed solely for lawful marriage (Nikkah). Any use of this website for casual dating, commercial solicitation, or fraudulent representation is strictly prohibited and results in immediate permanent account termination. Members and their legal guardians (Wali) warrant that all biographical, educational, marital, and legal residency details submitted are truthful and accurate.
            </p>
          </div>

          <div id="privacy" className="card-3d" style={{ padding: 'var(--space-xl)', borderLeft: '5px solid #0284C7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Lock size={22} color="#0284C7" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Privacy Policy</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.7, margin: 0 }}>
              Your privacy and modesty are paramount. Identity documents submitted for 10-Level Profile Verification are stored in a restricted private vault and are never displayed publicly. Members retain full control over their photo visibility (including Purdah Blur Shield) and contact disclosure.
            </p>
          </div>

          <div id="disclaimer" className="card-3d" style={{ padding: 'var(--space-xl)', borderLeft: '5px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <AlertCircle size={22} color="#D97706" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Matrimonial Safety Disclaimer</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.7, margin: 0 }}>
              While MarriageMediaUSA.com conducts manual validation and offers 10-point document verification, families and guardians (Wali) are strongly advised to perform independent family background checks prior to finalizing marriage commitments. Never send money or share financial credentials with any online acquaintance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <TrustSafetyFaq />

      <Footer />
      <BottomNav />
    </div>
  );
}
