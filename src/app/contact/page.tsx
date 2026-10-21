import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ContactForm } from '@/components/contact/ContactForm';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { getCmsPageSectionFromDb } from '@/db/queries';
import { connection } from 'next/server';

export const instant = false;

export default async function ContactPage() {
  await connection();
  const section = await getCmsPageSectionFromDb('contact', 'support_info').catch(() => null);
  const supportInfo = section?.contentJson as {
    phone?: string;
    email?: string;
    officeAddress?: string;
    officeHours?: string;
  } | undefined;

  const email = supportInfo?.email || 'info@muslimbibah.com';
  const phone = supportInfo?.phone || '+1 (313) 466-4589';
  const officeAddress = supportInfo?.officeAddress || 'Michigan, USA & Tri-State Desk';
  const officeHours = supportInfo?.officeHours || 'Mon - Fri: 9:00 AM - 6:00 PM EST';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.9) 100%), url("https://muslimbibah.com/design/admin_panel/slider_images/bride_b-620x330.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            24/7 Matrimonial Support Desk
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
            Contact MuslimBibah.com
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Have questions about registration, 10-Level Profile Verification, or VIP Matchmaking? Get in touch with our team.
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--space-3xl)', flex: 1 }}>
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-xl)', alignItems: 'start' }}>
            {/* Left Contact Info Cards (Dynamically populated from PostgreSQL cms_page_sections) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '5px solid #059669' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <img
                    src="https://muslimbibah.com/design/img/address-1.png"
                    alt="Contact MuslimBibah"
                    style={{ width: 52, height: 52, objectFit: 'contain' }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                      Official Contact Channels
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Direct Email & Verification Support
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={18} color="#059669" />
                    <div>
                      <strong>General Inquiries:</strong>{' '}
                      <a href={`mailto:${email}`} style={{ color: '#059669', fontWeight: 800 }}>
                        {email}
                      </a>
                    </div>
                  </div>

                  {phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Phone size={18} color="#D97706" />
                      <div>
                        <strong>Concierge Phone / WhatsApp:</strong>{' '}
                        <a href={`tel:${phone}`} style={{ color: '#D97706', fontWeight: 800 }}>
                          {phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={18} color="#c0392b" />
                    <div>
                      <strong>10-Level Document Verification:</strong>{' '}
                      <a href="mailto:support@muslimbibah.com" style={{ color: '#c0392b', fontWeight: 800 }}>
                        support@muslimbibah.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={18} color="#0284C7" />
                    <div>
                      <strong>Official Office / Regional Desk:</strong> {officeAddress}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={18} color="#6366F1" />
                    <div>
                      <strong>Office Hours:</strong> {officeHours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-3d-gold" style={{ padding: 'var(--space-xl)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#78350F', marginTop: 0, marginBottom: 8 }}>
                  How to Verify Your Profile by Email
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.65, margin: 0 }}>
                  To receive the <strong>Verified Profile Badge</strong>, please send clear scanned copies of your National ID / Passport, Educational Certificates, and Employment ID to <strong>support@muslimbibah.com</strong> along with your 10-digit MuslimBibah Profile ID.
                </p>
              </div>
            </div>

            {/* Right Interactive "Leave Us a Message" 3D Form */}
            <div className="card-3d" style={{ padding: 'var(--space-2xl)', borderTop: '5px solid #e74c3c' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: 0, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Leave Us a <span style={{ color: '#c0392b' }}>Message</span>
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Fill out the form below and our customer support specialists will respond promptly.
              </p>

              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
