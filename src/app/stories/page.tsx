'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { SuccessStoriesWall } from '@/components/home/SuccessStoriesWall';
import { Heart, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function StoriesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [storyText, setStoryText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(15, 23, 42, 0.88) 100%), url("https://marriagemediausa.com/design/admin_panel/slider_images/LOVE-love-36983825-1680-1050.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            <Heart size={13} /> Alhamdulillah — Real Couples & Testimonials
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
            Marriage Media USA Success Stories
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Celebrating blessed Nikkah unions formed through MarriageMediaUSA.com across Bangladesh, the United States, and around the world.
          </p>
        </div>
      </section>

      {/* Real Couple Stories, Parallax Banner, Testimonials Slider & Videos */}
      <SuccessStoriesWall />

      {/* Share Your Success Story Form (from https://marriagemediausa.com/story) */}
      <section style={{ paddingBlock: 'var(--space-3xl)', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <div className="ornamental-header" style={{ marginBottom: 'var(--space-xl)' }}>
            <span className="badge badge-emerald" style={{ marginBottom: 8 }}>
              <Sparkles size={12} /> Inspire Other Families
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              Post Your <span style={{ color: '#c0392b' }}>Success Story</span>
            </h2>
            <img
              src="/images/w-title-b.png"
              alt="Divider"
              className="ornamental-divider"
            />
          </div>

          <div className="card-3d" style={{ padding: 'var(--space-2xl)', borderTop: '5px solid #059669' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px' }}>
                  MashaAllah! Your Success Story Has Been Submitted
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', maxWidth: 520, margin: '0 auto 18px' }}>
                  Thank you, <strong>{brideName} & {groomName}</strong>! Our team will review your story and publish it on the Marriage Media USA Success Stories wall.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-3d-emerald"
                  style={{ padding: '10px 22px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
                >
                  Submit Another Story
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Bride Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g., Farzana"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Groom Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g., Faisal"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Nikkah / Marriage Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={marriageDate}
                      onChange={(e) => setMarriageDate(e.target.value)}
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                      Marriage Media USA Profile ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., #2021027948"
                      className="input-3d"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                    How Did You Meet on MarriageMediaUSA.com? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Share your Alhamdulillah journey to inspire other brothers, sisters, and families..."
                    className="input-3d"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-3d-crimson"
                  style={{
                    padding: '13px 26px',
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
                  <Send size={16} /> Submit Success Story
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
