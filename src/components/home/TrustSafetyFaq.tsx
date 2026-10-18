'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

export function TrustSafetyFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Authentic FAQs from https://marriagemediausa.com/Welcome2/faq + Halal Matrimonial Governance
  const faqs = [
    {
      q: '1. How can I register on MarriageMediaUSA.com?',
      a: 'Registration on MarriageMediaUSA.com is 100% free. Click on the "Register" button in the top navigation bar, fill in your basic profile information (Name, Gender, Date of Birth, Religion, Mother Tongue, Email, and Mobile Number), and submit. Once validated by our team, your profile becomes active for partner search.',
    },
    {
      q: '2. What is Profile Validation and 10-Level Verification?',
      a: 'Every profile submitted on MarriageMediaUSA.com undergoes manual validation by our team before going live. Furthermore, members can earn Verification Badges across 10 credentials—Identity (Passport/NID/Driving License), Citizenship, Age, Education, Profession, Marital Status, Religion, Address, Mobile, and Email—by emailing supporting documents to support@marriagemediausa.com.',
    },
    {
      q: '3. Can I register a marriage profile on behalf of a relative, son, daughter, or sibling?',
      a: 'Yes! Parents, brothers, sisters, relatives, and legal guardians (Wali) frequently create and manage matrimonial profiles on behalf of the bride or groom. During registration, simply select who the profile is being created for (Self, Son, Daughter, Brother, Sister, Relative, or Friend).',
    },
    {
      q: '4. What will be the privacy of my Photographs and Purdah Shield?',
      a: 'Marriage Media USA provides strict photo privacy controls. You can keep your photographs visible to all members, visible only to registered/approved members, or protected behind our Purdah Modesty Blur Shield so that your clear photo is only revealed upon your explicit consent.',
    },
    {
      q: '5. Why is Wali (Guardian) involvement mandatory for female biodatas?',
      a: 'In accordance with the authentic Sunnah of Prophet Muhammad (ﷺ), family and Wali involvement ensures dignity, safety, and serious marriage intent. Verified guardian details protect sisters from casual or non-serious inquiries.',
    },
    {
      q: '6. How do I upgrade my membership or contact Customer Support?',
      a: 'You can start with our Free Membership Plan (which includes 19+ features) or upgrade to Silver ($2,000), Gold ($3,000), Platinum ($4,000), or US Elite VIP ($6,500) for verified contact unlocks and dedicated matchmaking counselor assistance. For any assistance, email info@marriagemediausa.com or support@marriagemediausa.com.',
    },
  ];

  return (
    <section
      id="safety-faq"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
        {/* 3D Anti-Fraud Trust Banner */}
        <div
          className="card-3d-rose"
          style={{
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-3xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap',
            borderLeft: '6px solid #e74c3c',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 280 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ff5e4d, #c0392b)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 0 #7f1d1d, 0 8px 16px rgba(192,57,43,0.25)',
              }}
            >
              <ShieldAlert size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#991B1B', fontSize: '1.125rem' }}>
                100% ID Verified & Safe Matrimony Guarantee
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', marginTop: 4, marginBottom: 0, lineHeight: 1.55 }}>
                Your safety and modesty are our primary responsibility. Never transfer funds or share financial accounts with any matrimonial suitor. Report any suspicious activity immediately to <strong>support@marriagemediausa.com</strong>.
              </p>
            </div>
          </div>

          <div>
            <a
              href="mailto:support@marriagemediausa.com"
              className="btn-3d-crimson"
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertTriangle size={14} /> Report to Support Desk
            </a>
          </div>
        </div>

        {/* FAQ Section Header */}
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-emerald" style={{ marginBottom: 8 }}>
            <HelpCircle size={12} />
            MarriageMediaUSA.com Official Help Center
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
            Frequently Asked <span style={{ color: '#c0392b' }}>Questions (FAQ)</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 620, margin: '0 auto' }}>
            Clear answers about Registration, 10-Level Profile Verification, Photo Privacy, and Membership Plans.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 3D Accordion Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.q}
                className="card-3d"
                style={{
                  overflow: 'hidden',
                  borderLeft: isOpen ? '5px solid #059669' : '5px solid #CBD5E1',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    background: isOpen ? 'linear-gradient(90deg, #F0FDF4 0%, #FFFFFF 100%)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.q}
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: isOpen ? '#059669' : '#F1F5F9',
                      color: isOpen ? '#FFFFFF' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isOpen ? '0 3px 8px rgba(5,150,105,0.3)' : 'none',
                    }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 18px',
                      fontSize: '0.875rem',
                      color: 'var(--text-body)',
                      lineHeight: 1.7,
                      borderTop: '1px solid #E2E8F0',
                      paddingTop: 14,
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
