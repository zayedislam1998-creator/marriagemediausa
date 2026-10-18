import Link from 'next/link';
import { ShieldCheck, Mail, PhoneCall, Globe, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="app-footer"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: '#cbd5e1',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        borderTop: '4px solid #059669',
        boxShadow: 'inset 0 12px 30px rgba(0, 0, 0, 0.45)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingInline: 'var(--space-lg)',
        }}
      >
        <div className="footer-links-grid">
          {/* Column 1: Marriage Media USA Official Brand Info */}
          <div className="footer-brand-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="brand-logo-badge">
                <img
                  src="/logo.png"
                  alt="Marriage Media USA"
                  style={{ height: 32, width: 'auto' }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  <span style={{ color: '#34d399' }}>Muslim</span>Bibah
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700 }}>
                  BD WORLD GROUP INC • USA & GLOBAL
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: 12 }}>
              Welcome to <strong>MarriageMediaUSA.com</strong>, one of the leading and most trusted matrimony sites in the
              world. Specializing in 100% Halal matchmaking, 10-Level Profile Verification, and verified Wali family
              introductions across Bangladesh, USA, UK, Canada, Europe, and the Middle East.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} style={{ color: '#34d399' }} /> info@marriagemediausa.com
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={14} style={{ color: '#38bdf8' }} /> marriagemediausa.com
              </span>
            </div>
          </div>

          {/* Column 2: Information (Exact Links from Live Site) */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: '2px solid rgba(52, 211, 153, 0.3)',
                display: 'inline-block',
              }}
            >
              Information
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.78rem' }}>
              <li><Link href="/register" style={{ color: '#cbd5e1' }}>✨ Free Registration</Link></li>
              <li><Link href="/why-us" style={{ color: '#cbd5e1' }}>🏛️ About Us & Team</Link></li>
              <li><Link href="/how-it-works" style={{ color: '#cbd5e1' }}>📖 How It Works</Link></li>
              <li><Link href="/contact" style={{ color: '#cbd5e1' }}>📞 Contact Helpdesk</Link></li>
              <li><Link href="/contact?topic=Feedback" style={{ color: '#cbd5e1' }}>💬 Member Feedback</Link></li>
              <li><Link href="/stories" style={{ color: '#cbd5e1' }}>💍 Success Stories</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Safety (Exact Links from Live Site) */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: '2px solid rgba(251, 191, 36, 0.3)',
                display: 'inline-block',
              }}
            >
              Legal & Safety
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.78rem' }}>
              <li><Link href="/membership-plan" style={{ color: '#cbd5e1' }}>💎 Membership Plans</Link></li>
              <li><Link href="/how-it-works#terms" style={{ color: '#cbd5e1' }}>📜 Terms of Use</Link></li>
              <li><Link href="/how-it-works#privacy" style={{ color: '#cbd5e1' }}>🔒 Purdah Shield</Link></li>
              <li><Link href="/how-it-works#disclaimer" style={{ color: '#cbd5e1' }}>⚖️ Disclaimer</Link></li>
              <li><Link href="/contact?topic=Report+Scammers/Abuse" style={{ color: '#fda4af' }}>🚨 Fraud Alert</Link></li>
              <li><Link href="/contact?topic=Complaint" style={{ color: '#cbd5e1' }}>📝 Complaints</Link></li>
            </ul>
          </div>

          {/* Column 4: More! & 10-Level Verification */}
          <div className="footer-support-column">
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: '2px solid rgba(244, 63, 94, 0.3)',
                display: 'inline-block',
              }}
            >
              More! & Verification
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.78rem' }}>
              <li><Link href="/search" style={{ color: '#cbd5e1' }}>🔍 Advanced Search</Link></li>
              <li><Link href="/why-us" style={{ color: '#cbd5e1' }}>🌟 Why Marriage Media USA</Link></li>
              <li><Link href="/#safety-faq" style={{ color: '#cbd5e1' }}>❓ Matrimony FAQs</Link></li>
              <li><Link href="/stories#testimonials" style={{ color: '#cbd5e1' }}>🗣️ Testimonials</Link></li>
              <li><Link href="/why-us#verify-profile" style={{ color: '#34d399', fontWeight: 700 }}>✅ 10-Level Verification</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#94a3b8',
            gap: '1rem',
          }}
        >
          <div>
            Copyright © 2026 <strong>MarriageMediaUSA.com</strong> (BD World Group Inc). All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 700 }}>
              <ShieldCheck size={15} /> Highest 10-Level Profile Verification Worldwide
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
