'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.9) 100%), url("https://marriagemediausa.com/design/admin_panel/slider_images/bride_b-620x330.jpg")',
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
            Contact MarriageMediaUSA.com
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Have questions about registration, 10-Level Profile Verification, or VIP Matchmaking? Get in touch with our team.
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--space-3xl)', flex: 1 }}>
        <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-xl)', alignItems: 'start' }}>
            {/* Left Contact Info Cards (from https://marriagemediausa.com/contact) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '5px solid #059669' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <img
                    src="https://marriagemediausa.com/design/img/address-1.png"
                    alt="Contact Marriage Media USA"
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
                      <a href="mailto:info@marriagemediausa.com" style={{ color: '#059669', fontWeight: 800 }}>
                        info@marriagemediausa.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={18} color="#c0392b" />
                    <div>
                      <strong>10-Level Document Verification:</strong>{' '}
                      <a href="mailto:support@marriagemediausa.com" style={{ color: '#c0392b', fontWeight: 800 }}>
                        support@marriagemediausa.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={18} color="#0284C7" />
                    <div>
                      <strong>US Regional Representative:</strong> Michigan, USA & Tri-State Desk
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-3d-gold" style={{ padding: 'var(--space-xl)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#78350F', marginTop: 0, marginBottom: 8 }}>
                  How to Verify Your Profile by Email
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.65, margin: 0 }}>
                  To receive the <strong>Verified Profile Badge</strong>, please send clear scanned copies of your National ID / Passport, Educational Certificates, and Employment ID to <strong>support@marriagemediausa.com</strong> along with your 10-digit Marriage Media USA Profile ID.
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

              {sent ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                  <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px' }}>
                    JazakAllahu Khayran, {name}!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: 18 }}>
                    Your message has been received by our support desk (info@marriagemediausa.com). We will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="btn-3d-emerald"
                    style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 or +880 phone number"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your question or inquiry here..."
                      className="input-3d"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-3d-crimson"
                    style={{
                      padding: '13px 24px',
                      borderRadius: 12,
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
