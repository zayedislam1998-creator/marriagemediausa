'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
  RefreshCw,
  Globe,
  Sliders,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  createCmsStoryAction,
  createCmsArticleAction,
  toggleCmsStoryPublishAction,
  deleteCmsStoryAction,
  toggleCmsArticlePublishAction,
  deleteCmsArticleAction,
  saveCmsPageSectionAction,
} from '@/lib/admin/actions';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Wali & Fiqh' | 'Purdah Privacy' | 'KYC & Safety' | 'Membership & Credits';
  active: boolean;
}

interface CampaignItem {
  id: string;
  name: string;
  placement: string;
  targetRegion: string;
  active: boolean;
}

export interface CmsStudioStory {
  id: number | string;
  title: string;
  couple: string;
  date: string;
  location: string;
  excerpt: string;
  photoUrl: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface CmsStudioArticle {
  id: number | string;
  title: string;
  category: string;
  reads: number;
  publishedDate: string;
  author: string;
  status: 'PUBLISHED' | 'DRAFT';
}

interface EditorCmsStudioProps {
  initialStories?: any[];
  initialArticles?: any[];
}

export function EditorCmsStudio({ initialStories = [], initialArticles = [] }: EditorCmsStudioProps) {
  const [activeTab, setActiveTab] = useState<'stories' | 'articles' | 'faqs' | 'banners' | 'pages'>('stories');
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<CmsStudioStory[]>([]);
  const [articles, setArticles] = useState<CmsStudioArticle[]>([]);
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
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  // FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 'FAQ-01',
      question: 'Why is Wali (Guardian) contact mandatory for female biodatas?',
      answer:
        'In accordance with authentic Prophetic Sunnah and Islamic jurisprudence, MuslimBibah ensures every sister is represented with dignity and family oversight through a verified Wali (Father, Brother, or Legal Guardian).',
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

  // Campaigns / Banners State
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
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

  // Page Sections & SEO Editing State
  const [supportPhone, setSupportPhone] = useState('+1 (718) 555-HALAL');
  const [supportEmail, setSupportEmail] = useState('support@muslimbibah.com');
  const [officeAddress, setOfficeAddress] = useState('545 5th Ave, Suite 900, New York, NY 10017');
  const [officeHours, setOfficeHours] = useState('Monday - Friday: 9:00 AM - 6:00 PM EST');

  const [seoTitleTemplate, setSeoTitleTemplate] = useState('%s | MuslimBibah.com — USA & Global Halal Matrimonial Platform');
  const [seoDefaultDescription, setSeoDefaultDescription] = useState(
    'Authentic 100% Halal Islamic Matrimonial Platform for Practicing Muslims in the United States, Canada, and Worldwide. Verified Wali oversight, Purdah privacy, and zero dating culture.'
  );
  const [seoCanonicalDomain, setSeoCanonicalDomain] = useState('https://muslimbibah.com');

  const [homeHeroTagline, setHomeHeroTagline] = useState('100% Halal Islamic Matrimony for Practicing Muslims');
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState('Direct Wali involvement, Purdah modesty protection, and verified North American diaspora biodatas.');
  const [isSavingPageSection, setIsSavingPageSection] = useState(false);

  // Load from PostgreSQL API on mount
  const loadCmsDataFromDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cms');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.stories)) {
            setStories(
              data.stories.map((s: any) => ({
                id: s.id,
                title: s.title,
                couple: s.coupleNames || s.couple || 'Anonymous Couple',
                date: s.weddingDate ? new Date(s.weddingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'October 2026',
                location: s.storyBody?.includes('Location:') ? s.storyBody.split('Location:')[1].trim() : 'United States',
                excerpt: s.storyBody?.includes('Location:') ? s.storyBody.split('Location:')[0].trim() : s.storyBody || '',
                photoUrl: s.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                status: s.isPublished ? 'PUBLISHED' : 'DRAFT',
              }))
            );
          }
          if (Array.isArray(data.articles)) {
            setArticles(
              data.articles.map((a: any) => ({
                id: a.id,
                title: a.title,
                category: a.category,
                reads: a.readsCount || 0,
                publishedDate: a.publishedAt ? new Date(a.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                author: a.author || 'Editorial Board',
                status: a.isPublished ? 'PUBLISHED' : 'DRAFT',
              }))
            );
          }
          if (Array.isArray(data.sections)) {
            for (const sec of data.sections) {
              if (sec.pageKey === 'faq' && sec.sectionKey === 'general_faq' && Array.isArray(sec.contentJson)) {
                setFaqs(sec.contentJson);
              }
              if (sec.pageKey === 'home' && sec.sectionKey === 'hero_banners' && Array.isArray(sec.contentJson)) {
                setCampaigns(sec.contentJson);
              }
              if (sec.pageKey === 'contact' && sec.sectionKey === 'support_info' && sec.contentJson) {
                if (sec.contentJson.phone) setSupportPhone(sec.contentJson.phone);
                if (sec.contentJson.email) setSupportEmail(sec.contentJson.email);
                if (sec.contentJson.officeAddress) setOfficeAddress(sec.contentJson.officeAddress);
                if (sec.contentJson.officeHours) setOfficeHours(sec.contentJson.officeHours);
              }
              if (sec.pageKey === 'seo' && sec.sectionKey === 'meta_defaults' && sec.contentJson) {
                if (sec.contentJson.titleTemplate) setSeoTitleTemplate(sec.contentJson.titleTemplate);
                if (sec.contentJson.defaultDescription) setSeoDefaultDescription(sec.contentJson.defaultDescription);
                if (sec.contentJson.canonicalDomain) setSeoCanonicalDomain(sec.contentJson.canonicalDomain);
              }
              if (sec.pageKey === 'home' && sec.sectionKey === 'hero_copy' && sec.contentJson) {
                if (sec.contentJson.tagline) setHomeHeroTagline(sec.contentJson.tagline);
                if (sec.contentJson.subtitle) setHomeHeroSubtitle(sec.contentJson.subtitle);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load CMS data from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsDataFromDb();
  }, []);

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
      await loadCmsDataFromDb();
      setStoryModalOpen(false);
      setStoryTitle('');
      setStoryCouple('');
      setStoryExcerpt('');
      setFeedback(`✓ Published blessed couple story to PostgreSQL: "${res.story.title}"`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Could not publish story'}`);
    }
  };

  const handleToggleStory = async (id: number | string, currentIsPublished: boolean) => {
    setFeedback(null);
    const numId = Number(id);
    if (!numId) return;
    const res = await toggleCmsStoryPublishAction(numId, !currentIsPublished);
    if (res.success) {
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: !currentIsPublished ? 'PUBLISHED' : 'DRAFT' } : s))
      );
      setFeedback(`✓ Story status updated to ${!currentIsPublished ? 'PUBLISHED' : 'DRAFT'}`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to update story status'}`);
    }
  };

  const handleDeleteStory = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this couple story permanently?')) return;
    setFeedback(null);
    const numId = Number(id);
    if (!numId) return;
    const res = await deleteCmsStoryAction(numId);
    if (res.success) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      setFeedback('✓ Story deleted permanently from database.');
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to delete story'}`);
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
    fd.append('excerpt', articleExcerpt || articleTitle);
    fd.append('content', articleContent || articleExcerpt || articleTitle);

    const res = await createCmsArticleAction(null, fd);
    setIsSavingArticle(false);

    if (res.success && res.article) {
      await loadCmsDataFromDb();
      setArticleModalOpen(false);
      setArticleTitle('');
      setArticleExcerpt('');
      setArticleContent('');
      setFeedback(`✓ Saved pre-marital guidance article to PostgreSQL: "${res.article.title}"`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Could not publish article'}`);
    }
  };

  const handleToggleArticle = async (id: number | string, currentIsPublished: boolean) => {
    setFeedback(null);
    const numId = Number(id);
    if (!numId) return;
    const res = await toggleCmsArticlePublishAction(numId, !currentIsPublished);
    if (res.success) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: !currentIsPublished ? 'PUBLISHED' : 'DRAFT' } : a))
      );
      setFeedback(`✓ Article status updated to ${!currentIsPublished ? 'PUBLISHED' : 'DRAFT'}`);
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to update article status'}`);
    }
  };

  const handleDeleteArticle = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this guidance article permanently?')) return;
    setFeedback(null);
    const numId = Number(id);
    if (!numId) return;
    const res = await deleteCmsArticleAction(numId);
    if (res.success) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setFeedback('✓ Article deleted permanently from database.');
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to delete article'}`);
    }
  };

  const handleToggleFaq = async (id: string) => {
    const updated = faqs.map((f) => (f.id === id ? { ...f, active: !f.active } : f));
    setFaqs(updated);
    const res = await saveCmsPageSectionAction({
      pageKey: 'faq',
      sectionKey: 'general_faq',
      title: 'Frequently Asked Questions',
      contentJson: updated,
    });
    if (res.success) {
      setFeedback('✓ FAQ visibility updated and persisted to PostgreSQL');
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const item: FaqItem = {
      id: `FAQ-${Date.now().toString().slice(-4)}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
      active: true,
    };
    const updated = [item, ...faqs];
    setFaqs(updated);
    setNewFaqQuestion('');
    setNewFaqAnswer('');

    const res = await saveCmsPageSectionAction({
      pageKey: 'faq',
      sectionKey: 'general_faq',
      title: 'Frequently Asked Questions',
      contentJson: updated,
    });
    if (res.success) {
      setFeedback(`✓ Added and persisted new FAQ under "${item.category}"`);
    }
  };

  const handleToggleCampaign = async (id: string) => {
    const updated = campaigns.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    setCampaigns(updated);
    const res = await saveCmsPageSectionAction({
      pageKey: 'home',
      sectionKey: 'hero_banners',
      title: 'Promotional Campaigns & Hero Ribbons',
      contentJson: updated,
    });
    if (res.success) {
      setFeedback('✓ Campaign banner status saved to PostgreSQL database');
    }
  };

  const handleSaveContactInfo = async () => {
    setIsSavingPageSection(true);
    setFeedback(null);
    const res = await saveCmsPageSectionAction({
      pageKey: 'contact',
      sectionKey: 'support_info',
      title: 'Concierge Support & Verification Office',
      contentJson: {
        phone: supportPhone,
        email: supportEmail,
        officeAddress,
        officeHours,
      },
    });
    setIsSavingPageSection(false);
    if (res.success) {
      setFeedback('✓ Concierge Contact Info saved to PostgreSQL and revalidated on public /contact');
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to save contact details'}`);
    }
  };

  const handleSaveSeoSettings = async () => {
    setIsSavingPageSection(true);
    setFeedback(null);
    const res = await saveCmsPageSectionAction({
      pageKey: 'seo',
      sectionKey: 'meta_defaults',
      title: 'Platform SEO & Meta Standards',
      contentJson: {
        titleTemplate: seoTitleTemplate,
        defaultDescription: seoDefaultDescription,
        canonicalDomain: seoCanonicalDomain,
      },
    });
    setIsSavingPageSection(false);
    if (res.success) {
      setFeedback('✓ Platform SEO Meta Defaults saved to PostgreSQL and revalidated site-wide');
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to save SEO metadata'}`);
    }
  };

  const handleSaveHomeHeroCopy = async () => {
    setIsSavingPageSection(true);
    setFeedback(null);
    const res = await saveCmsPageSectionAction({
      pageKey: 'home',
      sectionKey: 'hero_copy',
      title: 'Homepage Hero & Value Propositions',
      contentJson: {
        tagline: homeHeroTagline,
        subtitle: homeHeroSubtitle,
      },
    });
    setIsSavingPageSection(false);
    if (res.success) {
      setFeedback('✓ Homepage Hero Copy saved to PostgreSQL and revalidated on /');
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to save home copy'}`);
    }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Couple Stories (DB)
            </span>
            <Sparkles size={18} style={{ color: 'var(--emerald-600)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
            {stories.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: 4 }}>
            {stories.filter((s) => s.status === 'PUBLISHED').length} Published on Homepage
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Islamic Guidance Articles
            </span>
            <BookOpen size={18} style={{ color: 'var(--sapphire-600)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
            {articles.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sapphire-600)', marginTop: 4 }}>
            {articles.reduce((acc, a) => acc + (a.reads || 0), 0).toLocaleString()} Total Community Reads
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Trust & Purdah FAQs
            </span>
            <HelpCircle size={18} style={{ color: 'var(--gold-600)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
            {faqs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-600)', marginTop: 4 }}>
            {faqs.filter((f) => f.active).length} Active in Trust Center
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Persistence Engine
            </span>
            <CheckCircle size={18} style={{ color: 'var(--emerald-600)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
            PostgreSQL 16+
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: 4 }}>
            Direct Drizzle ORM • Zero In-Memory Loss
          </div>
        </div>
      </div>

      {/* Global Status / Alert */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            background: feedback.startsWith('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: feedback.startsWith('✓') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: feedback.startsWith('✓') ? 'var(--emerald-700)' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 800 }}
          >
            ✕
          </button>
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
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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

          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'pages' ? '3px solid var(--emerald-600)' : '3px solid transparent',
              color: activeTab === 'pages' ? 'var(--emerald-700)' : 'var(--text-muted)',
            }}
          >
            🌐 All Pages Copy & SEO
          </button>
        </div>

        <button
          type="button"
          onClick={loadCmsDataFromDb}
          disabled={loading}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing DB...' : 'Sync from DB'}
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
                💍 Blessed Couple Stories Studio (PostgreSQL-Backed)
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Curate authentic US & Global Muslim Nikkah testimonials for the homepage wall and /stories directory.
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
                  <span className={`badge ${s.status === 'PUBLISHED' ? 'badge-emerald' : 'badge-gold'}`}>
                    {s.status}
                  </span>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {s.location}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStory(s.id, s.status === 'PUBLISHED')}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '2px 6px' }}
                    >
                      {s.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStory(s.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '2px 6px', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
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
                📚 Islamic Pre-Marital Knowledge Base (PostgreSQL-Backed)
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Publish Sunnah spouse selection guides, Mahr rulings, and Wali responsibilities on the homepage Islamic Advice Hub.
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
                  <span className={`badge ${a.status === 'PUBLISHED' ? 'badge-emerald' : 'badge-gold'}`}>{a.status}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleArticle(a.id, a.status === 'PUBLISHED')}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.6875rem' }}
                  >
                    {a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(a.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.6875rem', color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
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
              ❓ Active Trust, Purdah & Wali FAQs (PostgreSQL-Persisted)
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
                      onClick={() => handleToggleFaq(f.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {f.active ? '✓ Published in Trust Center' : 'Hidden'}
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
                Publish FAQ Entry to PostgreSQL
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
                  onClick={() => handleToggleCampaign(c.id)}
                  className={`btn btn-sm ${c.active ? 'btn-primary' : 'btn-outline'}`}
                >
                  {c.active ? '✓ Active on Site' : 'Paused'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: All Pages Copy & SEO Editor */}
      {activeTab === 'pages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'var(--space-xl)' }}>
          {/* Section 1: Contact Concierge Desk Details */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Globe size={20} style={{ color: 'var(--sapphire-600)' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Concierge Desk & Contact Details
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Updates the verified public office address, phone, and hours on /contact.
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Concierge Hotline
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Office Address
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Office Hours
              </label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveContactInfo}
              disabled={isSavingPageSection}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Save size={14} /> Save Contact Info to Database
            </button>
          </div>

          {/* Section 2: Platform SEO Standards */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sliders size={20} style={{ color: 'var(--emerald-600)' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Platform SEO & Meta Standards
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Controls the global title template, canonical root, and search engine snippets.
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Title Template
              </label>
              <input
                type="text"
                value={seoTitleTemplate}
                onChange={(e) => setSeoTitleTemplate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Canonical Root URL
              </label>
              <input
                type="text"
                value={seoCanonicalDomain}
                onChange={(e) => setSeoCanonicalDomain(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={seoDefaultDescription}
                onChange={(e) => setSeoDefaultDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSeoSettings}
              disabled={isSavingPageSection}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Save size={14} /> Save SEO Standards to Database
            </button>
          </div>

          {/* Section 3: Homepage Hero Copy */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} style={{ color: 'var(--gold-600)' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Homepage Hero & Value Copy
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Customizes the main headline and subheadline on the homepage hero section.
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Primary Hero Tagline
              </label>
              <input
                type="text"
                value={homeHeroTagline}
                onChange={(e) => setHomeHeroTagline(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Subheadline
              </label>
              <textarea
                rows={3}
                value={homeHeroSubtitle}
                onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveHomeHeroCopy}
              disabled={isSavingPageSection}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Save size={14} /> Save Hero Copy to Database
            </button>
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
              Publish Blessed Couple Story to PostgreSQL
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
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isSavingStory}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSavingStory} className="btn btn-primary btn-sm">
                  {isSavingStory ? 'Publishing to DB...' : 'Publish Couple Story'}
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
              maxWidth: 500,
              width: '100%',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
              Publish Sunnah Guidance Article
            </h3>
            <form onSubmit={handleCreateArticle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                required
                placeholder="Article Title (e.g. Essential Islamic Questions Before Nikkah)"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="Sunnah Ethics">Sunnah Ethics</option>
                  <option value="Islamic Fiqh">Islamic Fiqh</option>
                  <option value="Wali Guidance">Wali Guidance</option>
                  <option value="Diaspora Guide">Diaspora Guide</option>
                  <option value="Mahr & Rights">Mahr & Rights</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Author / Scholarly Board"
                  value={articleAuthor}
                  onChange={(e) => setArticleAuthor(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Brief summary / excerpt for cards..."
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <textarea
                rows={4}
                required
                placeholder="Full article content and Islamic references..."
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isSavingArticle}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSavingArticle} className="btn btn-primary btn-sm">
                  {isSavingArticle ? 'Saving to DB...' : 'Publish Guide to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
