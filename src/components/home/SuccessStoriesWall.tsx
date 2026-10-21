'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  PlayCircle,
  UserPlus,
  LogIn,
  ArrowRight,
} from 'lucide-react';

const REAL_STORIES = [
  {
    id: 17,
    names: 'Pinky & Delowar',
    headline: 'I Cannot Imagine A Life Without Him',
    image: '/images/slider/Marriage_Muslim.webp',
    location: 'Dhaka & New York Diaspora',
    date: 'Blessed Nikkah Union',
    snippet:
      'I Found My Groom Through MuslimBibah Site, Which Transformed My Life. I Had Never Imagined That It Will Be Done Through Internet. Your Service Is Very Good And I Am Very Happy That Our Families Connected With Complete Honour.',
  },
  {
    id: 16,
    names: 'Farzana & Faisal',
    headline: 'Found My Life Partner on MuslimBibah',
    image: '/images/slider/Bride.webp',
    location: 'United States & Bangladesh',
    date: 'Blessed Nikkah Union',
    snippet:
      'MuslimBibah has played an important role in our lives. Our families met through MuslimBibah. I am thankful to MuslimBibah for helping me find my life partner. We both and our family are extremely happy with the 10-Level verification.',
  },
  {
    id: 14,
    names: 'Nayeem & Khadeja',
    headline: 'Found My Dream Partner on MuslimBibah',
    image: '/images/story-nayeem.jpg',
    location: 'Global Muslim Matrimony',
    date: 'Blessed Nikkah Union',
    snippet:
      'Thanks to MuslimBibah for helping us find each other and making our dream come true. It is the best way to search and find your life partner as per our dreams and Islamic family etiquette.',
  },
];

const TESTIMONIAL_SLIDES = [
  {
    id: 1,
    name: 'Shahidur Rahman & Family',
    role: 'Verified Member • Profile #2018054077',
    avatar: '/images/demo3.png',
    quote:
      'Alhamdulillah, MuslimBibah.com stands apart from every other matrimony site because of its 10-Level Profile Verification and mandatory Wali involvement. Our parents were able to speak directly with complete confidence and dignity.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rajia Sultana & Guardian',
    role: 'Verified Member • Profile #2018041017',
    avatar: '/images/demo.png',
    quote:
      'Registration is 100% Free with zero gimmicks, and the Purdah Photo Privacy Shield gave our family complete peace of mind. Within weeks we received respectful proposals from educated, practicing Muslim professionals.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sk Asif Iqbal & Family',
    role: 'Verified Member • Profile #2020098524',
    avatar: '/uploads/avatars/2020098524.webp',
    quote:
      'The search by Mother Tongue, Profession, City, and Country made finding compatible families effortless. We highly recommend MuslimBibah.com to every Muslim family in the USA, UK, Canada, and Bangladesh.',
    rating: 5,
  },
];

const CAMPAIGN_BANNERS = [
  '/images/banner-everit.jpg',
  '/images/banner-ads1.jpg',
  '/images/banner-001.jpg',
];

interface SuccessStoriesWallProps {
  stories?: Array<{
    id: number | string;
    coupleNames?: string | null;
    names?: string | null;
    title?: string | null;
    headline?: string | null;
    story?: string | null;
    storyBody?: string | null;
    snippet?: string | null;
    imageUrl?: string | null;
    image?: string | null;
    weddingDate?: string | null;
    marriageDate?: string | null;
    date?: string | null;
    location?: string | null;
  }>;
}

export function SuccessStoriesWall({ stories }: SuccessStoriesWallProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);

  const displayStories = stories && stories.length > 0
    ? stories.map((s) => ({
        id: s.id,
        names: s.coupleNames || s.names || 'Blessed Couple',
        headline: s.title || s.headline || 'Blessed Nikkah Union',
        image: s.imageUrl || s.image || '/images/slider/Marriage_Muslim.webp',
        location: s.location || 'Verified Matrimony Union',
        date: s.weddingDate || s.marriageDate || s.date || 'Blessed Nikkah Union',
        snippet: s.storyBody || s.story || s.snippet || 'Alhamdulillah, found each other through MuslimBibah.com with complete halal family consent.',
      }))
    : REAL_STORIES;

  useEffect(() => {
    const t1 = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIAL_SLIDES.length);
    }, 5000);
    const t2 = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % CAMPAIGN_BANNERS.length);
    }, 4000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  const currentTest = TESTIMONIAL_SLIDES[activeTestimonial];

  return (
    <section
      id="stories"
      style={{
        paddingBlock: '4rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 45%, #f8fafc 100%)',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingInline: 'var(--space-lg)',
        }}
      >
        {/* ============================================================
            1. REAL COUPLE SUCCESS STORIES (Pinky & Delowar, Farzana & Faisal, Nayeem & Khadeja)
           ============================================================ */}
        <div className="ornamental-header">
          <div className="badge badge-coral" style={{ marginBottom: 8, padding: '5px 14px' }}>
            <Heart size={12} /> Alhamdulillah • Real Married Couples
          </div>
          <h2>
            Our Real <span>Success Stories</span>
          </h2>
          <div className="ornamental-divider">
            <img src="/images/w-title-b.png" alt="Divider" />
          </div>
          <p style={{ color: '#475569', fontSize: '0.925rem', maxWidth: 650, margin: '0 auto' }}>
            Meet real couples who found their life partners through MuslimBibah.com and united their families
            in blessed Nikkah.
          </p>
        </div>

        {/* Real Stories (Swipe on Mobile, 3-Col on Desktop) */}
        <div className="mobile-horizontal-scroll" style={{ marginBottom: '4rem' }}>
          {displayStories.map((story) => (
            <div
              key={story.id}
              className="card-3d-rose"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
              }}
            >
              {/* Couple Real Photo */}
              <div style={{ position: 'relative', height: 245, overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src={story.image}
                  alt={story.names}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.45s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(225, 29, 72, 0.92)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  💍 {story.date}
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>
                  {story.names} • {story.location}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  “{story.headline}”
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.65, marginTop: 4, flex: 1 }}>
                  {story.snippet}
                </p>
                <div style={{ paddingTop: 10, borderTop: '1px solid #ffe4e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    href="/stories"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    Read Full Story <ArrowRight size={14} />
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800 }}>★★★★★</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            2. READY TO JOIN / ALREADY REGISTERED 3D PARALLAX CTA BANNER
               (Matching live muslimbibah.com video_area)
           ============================================================ */}
        <div
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: '4rem',
            backgroundImage: 'url(https://muslimbibah.com/design/admin_panel/slider/wedding-1556963483.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.35), 0 6px 0 #059669',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(95deg, rgba(15, 23, 42, 0.88) 0%, rgba(6, 78, 59, 0.82) 100%)',
              padding: '3rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 18,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
                Ready to Join With Us!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 18 }}>
                Create your 100% Free Matrimonial Profile and connect with verified brides and grooms worldwide.
              </p>
              <Link href="/register" className="btn-3d-crimson" style={{ padding: '12px 28px', fontSize: '0.92rem' }}>
                <UserPlus size={17} /> Register Now!
              </Link>
            </div>

            <div
              style={{
                padding: '1.5rem',
                borderRadius: 18,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
                Registered With Us Already!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 18 }}>
                Sign in to your account to view proposals, unlock verified Wali contacts, and chat in the Halal Lounge.
              </p>
              <Link href="/login" className="btn-3d-emerald" style={{ padding: '12px 28px', fontSize: '0.92rem' }}>
                <LogIn size={17} /> Login Now!
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. INTERACTIVE 3D TESTIMONIALS SLIDER (Matching testimonials_area)
           ============================================================ */}
        <div style={{ marginBottom: '4rem' }}>
          <div className="ornamental-header">
            <div className="badge badge-gold" style={{ marginBottom: 8, padding: '5px 14px' }}>
              <Sparkles size={12} /> Verified Family Feedback
            </div>
            <h2>
              Member <span>Testimonials</span> Slider
            </h2>
            <div className="ornamental-divider">
              <img src="/images/w-title-b.png" alt="Divider" />
            </div>
          </div>

          <div
            className="card-3d"
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: '2.5rem 2rem',
              background: 'linear-gradient(165deg, #ffffff 0%, #f0fdf4 100%)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            {/* Left Quote Box */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', gap: 4, color: '#f59e0b', marginBottom: 12 }}>
                {Array.from({ length: currentTest.rating }).map((_, i) => (
                  <Star key={i} size={18} fill="#f59e0b" />
                ))}
              </div>
              <Quote size={34} style={{ color: '#10b981', opacity: 0.35, marginBottom: 8 }} />
              <p
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  lineHeight: 1.75,
                  fontStyle: 'italic',
                  marginBottom: 18,
                }}
              >
                “{currentTest.quote}”
              </p>

              {/* Slider Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial(
                      (prev) => (prev - 1 + TESTIMONIAL_SLIDES.length) % TESTIMONIAL_SLIDES.length
                    )
                  }
                  className="btn-3d-emerald"
                  style={{ padding: '8px 14px' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIAL_SLIDES.length)
                  }
                  className="btn-3d-emerald"
                  style={{ padding: '8px 14px' }}
                >
                  <ChevronRight size={16} />
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginLeft: 8 }}>
                  Testimonial {activeTestimonial + 1} of {TESTIMONIAL_SLIDES.length}
                </span>
              </div>
            </div>

            {/* Right Circular Member Portrait (Matching test_man on live site) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #10b981',
                  boxShadow: '0 16px 32px rgba(5, 150, 105, 0.25)',
                  marginBottom: 12,
                  background: '#ffffff',
                }}
              >
                <img
                  src={currentTest.avatar}
                  alt={currentTest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {currentTest.name}
              </h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginTop: 3 }}>
                {currentTest.role}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            4. MATRIMONIAL VIDEO SHOWCASE & PARTNER BANNER CAROUSEL
               (Matching video_area-custom & myCarousel on live muslimbibah.com)
           ============================================================ */}
        <div>
          <div className="ornamental-header">
            <div className="badge badge-emerald" style={{ marginBottom: 8, padding: '5px 14px' }}>
              <PlayCircle size={12} /> Featured Matrimonial Videos & Highlights
            </div>
            <h2>
              Matrimonial <span>Video Showcase</span>
            </h2>
            <div className="ornamental-divider">
              <img src="/images/w-title-b.png" alt="Divider" />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.75rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="card-3d" style={{ overflow: 'hidden', padding: 12, background: '#0f172a' }}>
              <video
                controls
                preload="none"
                poster="/images/slider/Marriage_Muslim.webp"
                style={{ width: '100%', height: 280, borderRadius: 14, objectFit: 'cover' }}
              >
                <source
                  src="https://muslimbibah.com/design/admin_panel/video_images/videoplayback.mp4"
                  type="video/mp4"
                />
              </video>
              <div style={{ padding: '10px 6px 2px', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem' }}>
                🎬 MuslimBibah Official Matrimonial Story Highlight #1
              </div>
            </div>

            <div className="card-3d" style={{ overflow: 'hidden', padding: 12, background: '#0f172a' }}>
              <video
                controls
                preload="none"
                poster="/images/slider/Bride.webp"
                style={{ width: '100%', height: 280, borderRadius: 14, objectFit: 'cover' }}
              >
                <source
                  src="https://muslimbibah.com/design/admin_panel/video_images/Most_Beautiful_Virat_and_Anushkas_Loving_Ad.mp4"
                  type="video/mp4"
                />
              </video>
              <div style={{ padding: '10px 6px 2px', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem' }}>
                🎬 Sacred Marriage & Family Celebration Highlight #2
              </div>
            </div>
          </div>

          {/* Rotating Partner Banner Strip from live muslimbibah.com */}
          <div
            className="card-3d"
            style={{
              overflow: 'hidden',
              padding: 8,
              background: '#ffffff',
              maxWidth: 960,
              margin: '0 auto',
            }}
          >
            <img
              src={CAMPAIGN_BANNERS[activeBanner]}
              alt="MuslimBibah Partner Banner"
              style={{
                width: '100%',
                height: 105,
                objectFit: 'cover',
                borderRadius: 14,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
