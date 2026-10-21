'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function StorySubmitForm() {
  const [submitted, setSubmitted] = useState(false);
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [profileId, setProfileId] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brideName,
          groomName,
          weddingDate: marriageDate,
          profileId,
          storyBody: storyText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit success story. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
        <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px' }}>
          MashaAllah! Your Success Story Has Been Submitted
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', maxWidth: 520, margin: '0 auto 18px' }}>
          Thank you, <strong>{brideName} & {groomName}</strong>! Our team will review your story and publish it on the Success Stories wall.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setBrideName('');
            setGroomName('');
            setMarriageDate('');
            setProfileId('');
            setStoryText('');
          }}
          className="btn-3d-emerald"
          style={{ padding: '10px 22px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
        >
          Submit Another Story
        </button>
      </div>
    );
  }

  return (
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

      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#b91c1c',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

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
            Profile ID (Optional)
          </label>
          <input
            type="text"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            placeholder="e.g., #2021027948"
            className="input-3d"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
          How Did You Meet? *
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
        disabled={isSubmitting}
        className="btn-3d-crimson"
        style={{
          padding: '13px 26px',
          borderRadius: 12,
          fontWeight: 900,
          fontSize: '0.95rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Send size={16} /> {isSubmitting ? 'Submitting Story...' : 'Submit Success Story'}
      </button>
    </form>
  );
}
