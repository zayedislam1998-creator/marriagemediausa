'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import Link from 'next/link';
import {
  Building,
  Utensils,
  Camera,
  Flower2,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Calendar,
  MapPin,
} from 'lucide-react';

const SERVICES_LIST = [
  {
    id: 'venues',
    icon: <Building size={32} style={{ color: '#059669' }} />,
    title: 'Venue, Halls & Mosques',
    subtitle: 'Sacred Nikah Masjids & Segregated Banquet Halls',
    badge: '🕌 Sunnah Nikah Ready',
    desc: 'Handpicked family-friendly Islamic centres, historic mosques, and luxury banquet halls equipped with dedicated sound partitions and segregated guest lounges for practicing Muslim families.',
    perks: [
      'Authentic Nikah registration facilities with licensed Muslim Imams',
      'Gender-segregated halls with high privacy partitions',
      'Ablution (Wudu) areas & prayer spaces for all guests',
      'Available across New York, Texas, California, Chicago & DMV',
    ],
  },
  {
    id: 'catering',
    icon: <Utensils size={32} style={{ color: '#d97706' }} />,
    title: '100% Halal Catering',
    subtitle: 'Zabihah Halal Gourmet Feasts & Traditional Delicacies',
    badge: '🍖 Zabihah Certified',
    desc: 'Culinary excellence crafted strictly in accordance with Islamic dietary standards. Authentic South Asian, Arab, Turkish, and Western fusion menus with certified hand-slaughtered Zabihah meats.',
    perks: [
      '100% Hand-slaughtered Zabihah Halal meat verification certificate',
      'Zero alcohol policy with bespoke mocktail & gourmet beverage bars',
      'Buffet, plated service, and family-style traditional Dawats',
      'Customized dessert bars including Knafeh, Firni, and Baklava',
    ],
  },
  {
    id: 'photography',
    icon: <Camera size={32} style={{ color: '#0284c7' }} />,
    title: 'Modest Cinema & Photography',
    subtitle: 'Female-Crewed Purdah Coverage & Cinematic Storytelling',
    badge: '📸 100% Purdah Protected',
    desc: 'Capture the sacred Barakah of your special day with our modesty-first photo and video crews. All-female camera teams ensure complete privacy and comfort for sisters, hijabis, and niqabis.',
    perks: [
      'Exclusively female cinematographers & photographers for bride side',
      'Encrypted private storage vault with zero unauthorized leaks',
      'Cinematic 4K Nikah documentary highlighting Quran recitation & vows',
      'Luxury keepsake Italian leather photo albums with lifetime warranty',
    ],
  },
  {
    id: 'decor',
    icon: <Flower2 size={32} style={{ color: '#e11d48' }} />,
    title: 'Stage & Floral Decor',
    subtitle: 'Bespoke Nikah Arches, Royal Stages & Elegant Lighting',
    badge: '🌸 Bespoke Elegance',
    desc: 'Transform your venue into an oasis of understated Islamic luxury. From Quranic calligraphy backdrops to lush fresh floral arches and warm Moroccan ambient lantern lighting.',
    perks: [
      'Islamic geometric arches with authentic calligraphy accents',
      'Lush organic floral arrangements using seasonal fresh blossoms',
      'Warm ambient fairy lights, crystal chandeliers & brass lanterns',
      'Full setup, teardown & on-site coordinator on the wedding day',
    ],
  },
];

export default function WeddingServicesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <AppHeader />

      <main style={{ flex: 1, paddingBottom: '5rem' }}>
        {/* Hero Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
            padding: '4.5rem 1.5rem',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(52, 211, 153, 0.6)',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#ecfdf5',
                marginBottom: 16,
              }}
            >
              <Sparkles size={14} style={{ color: '#fbbf24' }} />
              Complete Sunnah-Compliant Matrimonial Ecosystem
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.18,
                marginBottom: 14,
                letterSpacing: '-0.02em',
              }}
            >
              Wedding Services &{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #34d399 0%, #fbbf24 60%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Halal Vendor Network
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                color: '#cbd5e1',
                lineHeight: 1.65,
                maxWidth: 680,
                margin: '0 auto 28px',
              }}
            >
              From sacred Nikah mosques and certified Zabihah caterers to all-female Purdah photography crews—we take care of every detail so your special day is filled with Barakah.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a href="#inquiry" className="btn-3d-crimson" style={{ padding: '13px 26px', fontSize: '0.95rem' }}>
                <PhoneCall size={18} />
                Inquire for Wedding Package
              </a>
              <Link href="/search" className="btn-3d-emerald" style={{ padding: '13px 24px', fontSize: '0.95rem' }}>
                <ShieldCheck size={18} />
                Find Life Partner First
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Core Services Showcase */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
          <div className="ornamental-header">
            <h2>
              What We Offer in <span>Wedding Services</span>
            </h2>
            <div className="ornamental-divider">
              <span style={{ fontSize: '1.2rem', color: '#059669' }}>❖ ❖ ❖</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 640, margin: '0 auto' }}>
              Every service is vetted to guarantee strict adherence to Islamic etiquette, dignity, and gender modesty.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
            {SERVICES_LIST.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className="card-3d"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  scrollMarginTop: 100,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {service.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#047857',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    {service.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                  {service.title}
                </h3>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginBottom: 12 }}>
                  {service.subtitle}
                </h4>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
                  {service.desc}
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    Service Highlights:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {service.perks.map((p, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem', color: '#1e293b', lineHeight: 1.45 }}>
                        <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wedding Services Inquiry Form */}
        <section
          id="inquiry"
          style={{
            maxWidth: 820,
            margin: '0 auto',
            paddingInline: '1.5rem',
            scrollMarginTop: 100,
          }}
        >
          <div
            className="card-3d-gold"
            style={{
              padding: '2.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px',
                borderRadius: 999,
                background: 'rgba(217, 119, 6, 0.15)',
                color: '#b45309',
                fontSize: '0.8rem',
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              <Calendar size={14} />
              Free Concierge Consultation
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
              Plan Your Blessed Wedding With Our Team
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: 540, margin: '0 auto 24px' }}>
              Tell us your preferred date, city, and expected guests. Our Halal wedding coordinator will contact you within 24 hours.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('JazakAllah Khair! Your wedding service inquiry has been received. Our coordinator will contact you shortly.');
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                textAlign: 'left',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
                  Full Name
                </label>
                <input type="text" required placeholder="Your full name" className="input-3d" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
                  Phone / WhatsApp
                </label>
                <input type="tel" required placeholder="+1 (555) 000-0000" className="input-3d" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
                  Event City / State
                </label>
                <input type="text" required placeholder="e.g. New York, Dallas, Toronto" className="input-3d" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
                  Services Needed
                </label>
                <select className="input-3d">
                  <option>All-Inclusive Full Wedding Package</option>
                  <option>Venue & Mosque Only</option>
                  <option>Halal Catering Only</option>
                  <option>Purdah Photography Only</option>
                  <option>Stage & Floral Decor Only</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                <button type="submit" className="btn-3d-emerald" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}>
                  <Sparkles size={18} />
                  Submit Wedding Service Inquiry
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
