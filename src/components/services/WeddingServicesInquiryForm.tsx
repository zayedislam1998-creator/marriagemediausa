'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function WeddingServicesInquiryForm() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cityState, setCityState] = useState('');
  const [serviceType, setServiceType] = useState('All-Inclusive Full Wedding Package');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WEDDING_SERVICE',
          fullName,
          phoneNumber,
          email,
          cityState,
          serviceType,
          subject: `Wedding Service Inquiry: ${serviceType}`,
          message: `Inquiry for ${serviceType} in ${cityState}. Contact: ${fullName} (${phoneNumber})`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit wedding inquiry. Please try again.');
      }

      setReferenceId(data.submissionId || null);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
          MashaAllah, {fullName}!
        </h3>
        <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.6 }}>
          Your wedding service request for <strong>{serviceType}</strong> in <strong>{cityState}</strong> has been received. Our Halal wedding coordinator will reach out to you directly.
        </p>
        {referenceId && (
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 10,
              color: '#065f46',
              fontWeight: 800,
              fontSize: '0.85rem',
              marginBottom: 20,
            }}
          >
            Inquiry Reference: <code style={{ color: '#047857' }}>{referenceId}</code>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFullName('');
              setPhoneNumber('');
              setEmail('');
              setCityState('');
              setReferenceId(null);
            }}
            className="btn-3d-emerald"
            style={{ padding: '10px 24px', borderRadius: 999, fontWeight: 800 }}
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        textAlign: 'left',
      }}
    >
      {errorMsg && (
        <div
          style={{
            gridColumn: '1 / -1',
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

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
          Full Name *
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="input-3d"
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
          Phone / WhatsApp *
        </label>
        <input
          type="tel"
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="input-3d"
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
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
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
          Event City / State *
        </label>
        <input
          type="text"
          required
          value={cityState}
          onChange={(e) => setCityState(e.target.value)}
          placeholder="e.g. New York, Dallas, Toronto"
          className="input-3d"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: 5 }}>
          Services Needed *
        </label>
        <select
          className="input-3d"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          style={{ width: '100%' }}
        >
          <option>All-Inclusive Full Wedding Package</option>
          <option>Venue & Mosque Only</option>
          <option>Halal Catering Only</option>
          <option>Purdah Photography Only</option>
          <option>Stage & Floral Decor Only</option>
        </select>
      </div>

      <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-3d-emerald"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '0.95rem',
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={18} />
          {isSubmitting ? 'Submitting Wedding Inquiry...' : 'Submit Wedding Service Inquiry'}
        </button>
      </div>
    </form>
  );
}
