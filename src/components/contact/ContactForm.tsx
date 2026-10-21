'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          phoneNumber: phone,
          email,
          message,
          type: 'GENERAL',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit message. Please try again.');
      }

      setReferenceId(data.submissionId || null);
      setSent(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
        <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px' }}>
          JazakAllahu Khayran, {name}!
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: 12 }}>
          Your message has been securely recorded by our support desk. We will contact you shortly.
        </p>
        {referenceId && (
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: '#f1f5f9',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: 18,
              border: '1px solid #cbd5e1',
            }}
          >
            Inquiry Reference ID: <code style={{ color: '#059669' }}>{referenceId}</code>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setName('');
              setPhone('');
              setEmail('');
              setMessage('');
              setReferenceId(null);
            }}
            className="btn-3d-emerald"
            style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {submitError && (
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
          {submitError}
        </div>
      )}

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
        disabled={isSubmitting}
        className="btn-3d-crimson"
        style={{
          padding: '13px 24px',
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
        <Send size={16} /> {isSubmitting ? 'Recording Inquiry...' : 'Send Message'}
      </button>
    </form>
  );
}
