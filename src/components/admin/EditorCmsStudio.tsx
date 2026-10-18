'use client';

import { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  CheckCircle,
  FileText,
  HelpCircle,
  Megaphone,
  MapPin,
  Calendar,
  Eye,
} from 'lucide-react';
import { CmsStory, CmsArticle } from '@/lib/admin/store';
import { createCmsStoryAction, createCmsArticleAction } from '@/lib/admin/actions';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Wali & Fiqh' | 'Purdah Privacy' | 'KYC & Safety' | 'Membership & Credits';
  active: boolean;
}

interface EditorCmsStudioProps {
  initialStories: CmsStory[];
  initialArticles: CmsArticle[];
}

export function EditorCmsStudio({ initialStories, initialArticles }: EditorCmsStudioProps) {
  const [activeTab, setActiveTab] = useState<'stories' | 'articles' | 'faqs' | 'banners'>('stories');
  const [stories, setStories] = useState<CmsStory[]>(initialStories);
  const [articles, setArticles] = useState<CmsArticle[]>(initialArticles);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Story Modal State
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyCouple, setStoryCouple] = useState('');
  const [storyDate, setStoryDate] = useState('October 2026');
  const [storyLocation, setStoryLocation] = useState('Houston, TX');
  const [storyExcerpt, setStoryExcerpt] = useState('');
  const [isSavingStory, setIsSavingStory] = useState(false);

  // Article Modal State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Sunnah Ethics');
  const [articleAuthor, setArticleAuthor] = useState('Council of North American Imams');
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 'FAQ-01',
      question: 'Why is Wali (Guardian) contact mandatory for female biodatas?',
      answer:
        'In accordance with authentic Prophetic Sunnah and Islamic jurisprudence, Marriage Media USA ensures every sister is represented with dignity and family oversight through a verified Wali (Father, Brother, or Legal Guardian).',
      category: 'Wali & Fiqh',
      active: true,
    },
    {
      id: 'FAQ-02',
      question: 'How does the 24px Purdah Gaussian Blur photo shield protect my privacy?',
      answer:
        'When BLURRED_PURDAH is active, our Sharp media engine generates a 24px Gaussian blurred WebP image on the server. Raw unblurred photo URLs are never exposed to unauthorized visitors without your explicit approval.',
      category: 'Purdah Privacy',
      active: true,
    },
    {
      id: 'FAQ-03',
      question: 'Where are my US Passport, State ID, and Degree certificates stored?',
      answer:
        'All KYC verification documents are stored strictly outside the public web root in /uploads/private/kyc/ and can only be inspected by authorized Trust & Safety Moderators.',
      category: 'KYC & Safety',
      active: true,
    },
    {
      id: 'FAQ-04',
      question: 'How do Contact Unlock Credits work across Silver ($2,000) and Gold ($3,000) tiers?',
      answer:
        'Each verified contact unlock deducts 1 credit atomically and reveals the suitor and Wali telephone numbers immediately, while logging the unlock for mutual accountability.',
      category: 'Membership & Credits',
      active: true,
    },
  ]);

  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState<FaqItem['category']>('Wali & Fiqh');

  // Promotional Campaigns State
  const [campaigns, setCampaigns] = useState([
    {
      id: 'CMP-01',
      name: 'US Medical & Engineering Suitors Spotlight',
      placement: 'Homepage Hero Ribbon',
      targetRegion: 'USA & Canada',
      active: true,
    },
    {
      id: 'CMP-02',
      name: '100% Wali-Verified Blessed Nikkah Drive',
      placement: 'Search Workspace Top Banner',
      targetRegion: 'Global Diaspora',
      active: true,
    },
    {
      id: 'CMP-03',
      name: 'US Elite Concierge ($6,500) Matchmaker Desk',
      placement: 'Member Dashboard Upgrade Card',
      targetRegion: 'NY, TX, CA, IL, VA',
      active: true,
    },
  ]);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStory(true);
    setFeedback(null);

    const fd = new FormData();
    fd.append('title', storyTitle);
    fd.append('couple', storyCouple);
    fd.append('date', storyDate);
    fd.append('location', storyLocation);
    fd.append('excerpt', storyExcerpt);

    const res = await createCmsStoryAction(null, fd);
    setIsSavingStory(false);

    if (res.success && res.story) {
      setStories((prev) => [res.story!, ...prev]);
      setStoryModalOpen(false);
      setStoryTitle('');
      setStoryCouple('');
      setStoryExcerpt('');
      setFeedback(`✓ Published blessed couple story: "${res.story.title}"`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Could not publish story'}`);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingArticle(true);
    setFeedback(null);

    const fd = new FormData();
    fd.append('title', articleTitle);
    fd.append('category', articleCategory);
    fd.append('author', articleAuthor);

    const res = await createCmsArticleAction(null, fd);
    setIsSavingArticle(false);

    if (res.success && res.article) {
      setArticles((prev) => [res.article!, ...prev]);
      setArticleModalOpen(false);
      setArticleTitle('');
      setFeedback(`✓ Published pre-marital guidance article: "${res.article.title}"`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Could not publish article'}`);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const item: FaqItem = {
      id: `FAQ-0${faqs.length + 1}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
      active: true,
    };
    setFaqs((prev) => [item, ...prev]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setFeedback(`✓ Added new FAQ under "${item.category}"`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Summary KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Published Couple Stories
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: 4 }}>
            {stories.length} Verified Nikkahs
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Islamic Guidance Articles
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sapphire-600)', marginTop: 4 }}>
            {articles.length} Editorial Guides
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Active Knowledge FAQs
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-600)', marginTop: 4 }}>
            {faqs.filter((f) => f.active).length} Live Answers
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Hero Spotlight Campaigns
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coral-500)', marginTop: 4 }}>
            {campaigns.filter((c) => c.active).length} Active Placements
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--emerald-50)',
            border: '1px solid var(--emerald-300)',
            color: 'var(--emerald-900)',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          {feedback}
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid var(--border-subtle)',
          paddingBottom: 2,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'stories' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'stories' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          💍 Couple Success Stories ({stories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('articles')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'articles' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'articles' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          📚 Pre-Marital Articles ({articles.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'faqs' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'faqs' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          ❓ Trust & Safety FAQs ({faqs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'banners' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'banners' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          🎯 Hero Banners & Campaigns
        </button>
      </div>

      {/* TAB 1: Success Stories Studio */}
      {activeTab === 'stories' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                💍 Blessed Couple Stories Studio
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Curate authentic US & Global Muslim Nikkah testimonials for the homepage wall.
              </p>
            </div>
            <button type="button" onClick={() => setStoryModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Publish New Couple Story
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'var(--space-md)',
            }}
          >
            {stories.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald">{s.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {s.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {s.couple}
                </h3>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--emerald-700)' }}>
                  {s.title}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
                  “{s.excerpt}”
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {s.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Articles */}
      {activeTab === 'articles' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                📚 Islamic Pre-Marital Knowledge Base
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Publish Sunnah spouse selection guides, Mahr rulings, and Wali responsibilities.
              </p>
            </div>
            <button type="button" onClick={() => setArticleModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Draft New Guide
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {articles.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={18} style={{ color: 'var(--sapphire-600)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {a.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span className="badge badge-sapphire">{a.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        By {a.author} • {a.publishedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={13} /> {a.reads.toLocaleString()} reads
                  </span>
                  <span className="badge badge-emerald">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FAQs */}
      {activeTab === 'faqs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-xl)' }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
              ❓ Active Trust, Purdah & Wali FAQs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {faqs.map((f) => (
                <div
                  key={f.id}
                  style={{
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-gold">{f.category}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFaqs((prev) =>
                          prev.map((item) => (item.id === f.id ? { ...item, active: !item.active } : item))
                        )
                      }
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {f.active ? '✓ Published' : 'Hidden'}
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: 4 }}>
                    {f.question}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {f.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              height: 'fit-content',
            }}
          >
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
              + Add New Matrimonial FAQ
            </h3>
            <form onSubmit={handleAddFaq} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={newFaqCategory}
                  onChange={(e) => setNewFaqCategory(e.target.value as FaqItem['category'])}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="Wali & Fiqh">Wali & Fiqh</option>
                  <option value="Purdah Privacy">Purdah Privacy</option>
                  <option value="KYC & Safety">KYC & Safety</option>
                  <option value="Membership & Credits">Membership & Credits</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Question
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How are US Medical & Engineering degrees verified?"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Official Answer
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clear Shariah-compliant and platform-verified guidance..."
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Publish FAQ Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Hero Banners */}
      {activeTab === 'banners' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
            🎯 Homepage Hero Banners & Diaspora Spotlight Placements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {campaigns.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Placement: {c.placement} • Target: {c.targetRegion}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCampaigns((prev) =>
                      prev.map((item) => (item.id === c.id ? { ...item, active: !item.active } : item))
                    )
                  }
                  className={`btn btn-sm ${c.active ? 'btn-primary' : 'btn-outline'}`}
                >
                  {c.active ? '✓ Active on Site' : 'Paused'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Modal */}
      {storyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-xl)',
              maxWidth: 480,
              width: '100%',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
              Publish Blessed Couple Story
            </h3>
            <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                required
                placeholder="Story Headline (e.g. Blessed Nikkah in Virginia)"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <input
                type="text"
                required
                placeholder="Couple Names (e.g. Dr. Imran & Sister Nadia)"
                value={storyCouple}
                onChange={(e) => setStoryCouple(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  required
                  placeholder="Wedding Date (e.g. Oct 2026)"
                  value={storyDate}
                  onChange={(e) => setStoryDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
                <input
                  type="text"
                  required
                  placeholder="City, State (e.g. Houston, TX)"
                  value={storyLocation}
                  onChange={(e) => setStoryLocation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <textarea
                rows={4}
                required
                placeholder="Authentic couple & Wali testimonial..."
                value={storyExcerpt}
                onChange={(e) => setStoryExcerpt(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setStoryModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingStory} className="btn btn-primary">
                  {isSavingStory ? 'Publishing...' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {articleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-xl)',
              maxWidth: 480,
              width: '100%',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
              Draft New Pre-Marital Guide
            </h3>
            <form onSubmit={handleCreateArticle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                required
                placeholder="Article Title"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <select
                value={articleCategory}
                onChange={(e) => setArticleCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="Sunnah Ethics">Sunnah Ethics</option>
                <option value="Islamic Fiqh">Islamic Fiqh</option>
                <option value="Diaspora Guide">Diaspora Guide</option>
                <option value="Wali & Family">Wali & Family</option>
              </select>
              <input
                type="text"
                required
                placeholder="Editorial Author"
                value={articleAuthor}
                onChange={(e) => setArticleAuthor(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setArticleModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingArticle} className="btn btn-primary">
                  {isSavingArticle ? 'Publishing...' : 'Publish Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
