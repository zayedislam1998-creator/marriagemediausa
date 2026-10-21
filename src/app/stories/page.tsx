import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { SuccessStoriesWall } from '@/components/home/SuccessStoriesWall';
import { StorySubmitForm } from '@/components/stories/StorySubmitForm';
import { Heart, Sparkles } from 'lucide-react';
import { getSuccessStoriesFromDb } from '@/db/queries';
import { connection } from 'next/server';

export const instant = false;

export default async function StoriesPage() {
  await connection();
  const dbStories = await getSuccessStoriesFromDb().catch(() => []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero Banner */}
      <section
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(15, 23, 42, 0.88) 100%), url("https://muslimbibah.com/design/admin_panel/slider_images/LOVE-love-36983825-1680-1050.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBlock: 'var(--space-3xl)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            <Heart size={13} /> Sacred Halal Unions
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
            MuslimBibah Success Stories
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Celebrating blessed Nikkah unions formed through MuslimBibah.com across Bangladesh, the United States, and around the world.
          </p>
        </div>
      </section>

      {/* Real Couple Stories, Parallax Banner, Testimonials Slider & Videos */}
      <SuccessStoriesWall stories={dbStories} />

      {/* Share Your Success Story Form (from https://muslimbibah.com/story) */}
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

          <StorySubmitForm />
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
