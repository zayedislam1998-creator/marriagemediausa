import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

const DEFAULT_ARTICLES = [
  {
    title: 'The Mutual Rights & Responsibilities of Husband and Wife in Islam',
    category: 'Sunnah Marriage Guidelines',
    readTime: '6 min read',
    author: 'Sheikh Dr. Tariq Al-Mansoor',
    snippet:
      'A comprehensive guide to Mawaddah (deep love) and Rahmah (mercy) in the marital home, balancing emotional care, financial dignity, and spiritual partnership.',
    badgeColor: 'badge-emerald',
    accent: '#059669',
  },
  {
    title: '12 Essential Questions to Clarify Before Finalizing Your Nikkah',
    category: 'Pre-Marital Counseling',
    readTime: '8 min read',
    author: 'Ustadha Fatima Siddiqui, LMFT',
    snippet:
      'Practical communication frameworks covering religious practice, family living arrangements, career goals, financial habits, and conflict resolution.',
    badgeColor: 'badge-sapphire',
    accent: '#0284C7',
  },
  {
    title: 'Understanding Mahr (Dower) According to Authentic Sunnah',
    category: 'Islamic Jurisprudence',
    readTime: '5 min read',
    author: 'Mufti Ahmadullah Qasimi',
    snippet:
      'The sacred wisdom behind Mahr as an honor for the bride, avoiding excessive cultural burdens, and adhering to prophetic simplicity.',
    badgeColor: 'badge-gold',
    accent: '#D97706',
  },
  {
    title: 'The Sacred Role & Blessing of the Wali (Guardian) in Matrimony',
    category: 'Family Wisdom',
    readTime: '7 min read',
    author: 'Imam Siraj Wahhaj & Council',
    snippet:
      'Why Islam mandates the Wali to protect the bride from deception, evaluate suitors with maturity, and ensure a blessed union based on righteousness.',
    badgeColor: 'badge-coral',
    accent: '#e74c3c',
  },
];

export function IslamicAdviceHub({ articles: dbArticles }: { articles?: any[] }) {
  const articles =
    dbArticles && dbArticles.length > 0
      ? dbArticles.map((a, idx) => ({
          title: a.title,
          category: a.category,
          readTime: `${Math.max(4, Math.ceil((a.content?.length || 500) / 450))} min read`,
          author: a.author || 'Editorial Board',
          snippet: a.excerpt || a.content?.slice(0, 160),
          badgeColor: ['badge-emerald', 'badge-sapphire', 'badge-gold', 'badge-coral'][idx % 4],
          accent: ['#059669', '#0284C7', '#D97706', '#e74c3c'][idx % 4],
        }))
      : DEFAULT_ARTICLES;

  return (
    <section
      id="advice-hub"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-emerald" style={{ marginBottom: 8 }}>
            <BookOpen size={12} />
            Islamic Pre-Marital & Family Wisdom
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
            Pre-Marital Guidance & <span style={{ color: '#c0392b' }}>Sunnah Wisdom</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 640, margin: '0 auto' }}>
            Empower your marriage journey with scholarly articles, matrimonial jurisprudence, and practical counseling.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 4 Guidance Articles (2-Column on Mobile, 4-Col on Desktop) */}
        <div className="mobile-2col-grid">
          {articles.map((art) => (
            <article
              key={art.title}
              className="card-3d"
              style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
                borderTop: `4px solid ${art.accent}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge ${art.badgeColor}`} style={{ fontSize: '0.6875rem' }}>
                  {art.category}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <Clock size={12} /> {art.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 0', lineHeight: 1.4 }}>
                {art.title}
              </h3>

              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-700)', fontWeight: 800 }}>
                By {art.author}
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                {art.snippet}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                <Link
                  href="/how-it-works"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: art.accent,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  Read Guidance & Rules <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
