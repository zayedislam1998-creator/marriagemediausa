'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GatewayConfig {
  id: string;
  gateway: 'STRIPE' | 'PAYPAL';
  mode: 'TEST' | 'LIVE';
  isActive: boolean;
  publicKey: string;
  secretKeyMasked: string;
  hasSecretKey: boolean;
  webhookSecretMasked: string;
  hasWebhookSecret: boolean;
  webhookId?: string;
  settingsJson: Record<string, any>;
  lastTestedAt?: string | null;
  testStatus?: string | null;
  lastTestMessage?: string | null;
}

export function PaymentGatewaysTab() {
  const [configs, setConfigs] = useState<GatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Stripe Form State
  const [stripeActive, setStripeActive] = useState(false);
  const [stripeMode, setStripeMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [stripePk, setStripePk] = useState('');
  const [stripeSk, setStripeSk] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [showStripeSk, setShowStripeSk] = useState(false);
  const [showStripeWh, setShowStripeWh] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // PayPal Form State
  const [paypalActive, setPaypalActive] = useState(false);
  const [paypalMode, setPaypalMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [paypalWebhookId, setPaypalWebhookId] = useState('');
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [paypalTestResult, setPaypalTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const [savingGateway, setSavingGateway] = useState<'STRIPE' | 'PAYPAL' | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments/gateways');
      const data = await res.json();
      if (data.success && Array.isArray(data.configs)) {
        setConfigs(data.configs);

        // Populate Stripe
        const stripe = data.configs.find((c: GatewayConfig) => c.gateway === 'STRIPE');
        if (stripe) {
          setStripeActive(stripe.isActive);
          setStripeMode(stripe.mode);
          setStripePk(stripe.publicKey || '');
          setStripeSk('');
          setStripeWebhookSecret('');
          if (stripe.testStatus) {
            setStripeTestResult({
              success: stripe.testStatus === 'SUCCESS',
              message: stripe.lastTestMessage || 'Status recorded in DB',
            });
          }
        }

        // Populate PayPal
        const paypal = data.configs.find((c: GatewayConfig) => c.gateway === 'PAYPAL');
        if (paypal) {
          setPaypalActive(paypal.isActive);
          setPaypalMode(paypal.mode);
          setPaypalClientId(paypal.publicKey || '');
          setPaypalSecret('');
          setPaypalWebhookId(paypal.webhookId || '');
          if (paypal.testStatus) {
            setPaypalTestResult({
              success: paypal.testStatus === 'SUCCESS',
              message: paypal.lastTestMessage || 'Status recorded in DB',
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load gateway configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleTestStripe = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await fetch('/api/admin/payments/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'STRIPE',
          publicKey: stripePk,
          secretKey: stripeSk,
          mode: stripeMode,
        }),
      });
      const data = await res.json();
      setStripeTestResult({
        success: data.success,
        message: data.message,
        latency: data.latencyMs,
      });
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        message: `Network error while executing test ping: ${err.message}`,
      });
    } finally {
      setTestingStripe(false);
    }
  };

  const handleTestPaypal = async () => {
    setTestingPaypal(true);
    setPaypalTestResult(null);
    try {
      const res = await fetch('/api/admin/payments/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'PAYPAL',
          publicKey: paypalClientId,
          secretKey: paypalSecret,
          mode: paypalMode,
        }),
      });
      const data = await res.json();
      setPaypalTestResult({
        success: data.success,
        message: data.message,
        latency: data.latencyMs,
      });
    } catch (err: any) {
      setPaypalTestResult({
        success: false,
        message: `Network error while executing test ping: ${err.message}`,
      });
    } finally {
      setTestingPaypal(false);
    }
  };

  const handleSaveStripe = async () => {
    setSavingGateway('STRIPE');
    try {
      const res = await fetch('/api/admin/payments/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'STRIPE',
          mode: stripeMode,
          isActive: stripeActive,
          publicKey: stripePk,
          secretKey: stripeSk,
          webhookSecret: stripeWebhookSecret,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStripeActive(Boolean(data.isActive));
        setStatusMsg({ text: data.message || 'Stripe settings saved.', isError: false });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: `Failed to save Stripe: ${data.error}`, isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Save error: ${err.message}`, isError: true });
    } finally {
      setSavingGateway(null);
    }
  };

  const handleSavePaypal = async () => {
    setSavingGateway('PAYPAL');
    try {
      const res = await fetch('/api/admin/payments/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'PAYPAL',
          mode: paypalMode,
          isActive: paypalActive,
          publicKey: paypalClientId,
          secretKey: paypalSecret,
          webhookId: paypalWebhookId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaypalActive(Boolean(data.isActive));
        setStatusMsg({ text: data.message || 'PayPal settings saved.', isError: false });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: `Failed to save PayPal: ${data.error}`, isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Save error: ${err.message}`, isError: true });
    } finally {
      setSavingGateway(null);
    }
  };

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://muslimbibah.com';

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#059669' }} />
        <p style={{ color: '#64748B', fontWeight: 600 }}>Loading Payment Gateway Configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner Alert */}
      {statusMsg && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 12,
            backgroundColor: statusMsg.isError ? '#FEF2F2' : '#ECFDF5',
            border: `1.5px solid ${statusMsg.isError ? '#F87171' : '#10B981'}`,
            color: statusMsg.isError ? '#991B1B' : '#065F46',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {statusMsg.isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div style={{ padding: 14, borderRadius: 10, border: '1px solid #FCD34D', background: '#FFFBEB', color: '#78350F', fontSize: '.84rem', lineHeight: 1.6 }}>
        Before saving secret keys, configure <code>PAYMENT_CREDENTIALS_ENCRYPTION_KEY</code> on the server with a 32-byte hex key (for example, generate one with <code>openssl rand -hex 32</code>). Save settings while disabled, run the connection test, then enable and save again. Secret keys are write-only here.
      </div>

      {/* Header Info */}
      <div className="card-3d" style={{ padding: 24, background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={24} color="#059669" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Payment Gateways & Key Diagnostics</h2>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: '#64748B' }}>
              Configure Stripe & PayPal for membership packages and direct contact unlock credit recharge. Run live ping tests to verify keys.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                background: stripeActive || paypalActive ? '#ECFDF5' : '#FEF3C7',
                color: stripeActive || paypalActive ? '#065F46' : '#92400E',
                border: `1px solid ${stripeActive || paypalActive ? '#A7F3D0' : '#FDE68A'}`,
              }}
            >
              <Activity size={14} />
              {stripeActive && paypalActive
                ? 'Stripe & PayPal Active'
                : stripeActive
                ? 'Stripe Active'
                : paypalActive
                ? 'PayPal Active'
                : 'No Gateways Active'}
            </span>
          </div>
        </div>
      </div>

      {/* DUAL GATEWAYS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24 }}>
        {/* =========================================================
            1. STRIPE GATEWAY CARD
           ========================================================= */}
        <div className="card-3d" style={{ padding: 26, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                S
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Stripe Payments</h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Card, Apple Pay, Google Pay & 3DS2</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={stripeActive}
                  onChange={(e) => setStripeActive(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
                />
                {stripeActive ? <span style={{ color: '#059669' }}>Enabled</span> : <span style={{ color: '#94A3B8' }}>Disabled</span>}
              </label>
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Environment Mode:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStripeMode('TEST')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: stripeMode === 'TEST' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  background: stripeMode === 'TEST' ? '#FEF3C7' : '#F8FAFC',
                  color: stripeMode === 'TEST' ? '#92400E' : '#64748B',
                }}
              >
                🛠️ Test / Sandbox Mode
              </button>
              <button
                type="button"
                onClick={() => setStripeMode('LIVE')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: stripeMode === 'LIVE' ? '2px solid #10B981' : '1px solid #E2E8F0',
                  background: stripeMode === 'LIVE' ? '#ECFDF5' : '#F8FAFC',
                  color: stripeMode === 'LIVE' ? '#065F46' : '#64748B',
                }}
              >
                ⚡ Live Production
              </button>
            </div>
          </div>

          {/* Publishable Key */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Publishable Key ({stripeMode === 'TEST' ? 'pk_test_...' : 'pk_live_...'})
            </label>
            <input
              type="text"
              value={stripePk}
              onChange={(e) => setStripePk(e.target.value)}
              placeholder={stripeMode === 'TEST' ? 'pk_test_51P...' : 'pk_live_51P...'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Secret Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Secret Key ({stripeMode === 'TEST' ? 'sk_test_...' : 'sk_live_...'})
              </label>
              <button
                type="button"
                onClick={() => setShowStripeSk(!showStripeSk)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                {showStripeSk ? <EyeOff size={14} /> : <Eye size={14} />} {showStripeSk ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showStripeSk ? 'text' : 'password'}
              value={stripeSk}
              onChange={(e) => setStripeSk(e.target.value)}
              placeholder={stripeMode === 'TEST' ? 'sk_test_51P...' : 'sk_live_51P...'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Webhook Signing Secret */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Webhook Secret (whsec_...)
              </label>
              <button
                type="button"
                onClick={() => setShowStripeWh(!showStripeWh)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                {showStripeWh ? <EyeOff size={14} /> : <Eye size={14} />} {showStripeWh ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showStripeWh ? 'text' : 'password'}
              value={stripeWebhookSecret}
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Webhook Endpoint Copy */}
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>Webhook URL:</strong> {siteOrigin}/api/webhooks/stripe
            </div>
            <button
              type="button"
              onClick={() => handleCopyWebhook(`${siteOrigin}/api/webhooks/stripe`)}
              className="btn-3d-secondary"
              style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Copy size={12} /> {copiedUrl === `${siteOrigin}/api/webhooks/stripe` ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Test Ping Diagnostic Box */}
          {stripeTestResult && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: stripeTestResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1.5px solid ${stripeTestResult.success ? '#10B981' : '#F87171'}`,
                color: stripeTestResult.success ? '#065F46' : '#991B1B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {stripeTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <strong>{stripeTestResult.success ? 'Stripe Connection Active' : 'Stripe Test Failed'}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4 }}>{stripeTestResult.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 10 }}>
            <button
              type="button"
              onClick={handleTestStripe}
              disabled={testingStripe}
              className="btn-3d-secondary"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {testingStripe ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} color="#D97706" />}
              {testingStripe ? 'Pinging Stripe...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSaveStripe}
              disabled={savingGateway === 'STRIPE'}
              className="btn-3d"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {savingGateway === 'STRIPE' ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {savingGateway === 'STRIPE' ? 'Saving...' : 'Save Stripe Config'}
            </button>
          </div>
        </div>

        {/* =========================================================
            2. PAYPAL GATEWAY CARD
           ========================================================= */}
        <div className="card-3d" style={{ padding: 26, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0070BA, #003087)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                P
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>PayPal Orders v2</h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>PayPal Wallet, Pay Later & Cards</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={paypalActive}
                  onChange={(e) => setPaypalActive(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#0070BA', cursor: 'pointer' }}
                />
                {paypalActive ? <span style={{ color: '#0070BA' }}>Enabled</span> : <span style={{ color: '#94A3B8' }}>Disabled</span>}
              </label>
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Environment Mode:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setPaypalMode('TEST')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: paypalMode === 'TEST' ? '2px solid #0070BA' : '1px solid #E2E8F0',
                  background: paypalMode === 'TEST' ? '#EFF6FF' : '#F8FAFC',
                  color: paypalMode === 'TEST' ? '#1E40AF' : '#64748B',
                }}
              >
                🧪 Sandbox Mode
              </button>
              <button
                type="button"
                onClick={() => setPaypalMode('LIVE')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: paypalMode === 'LIVE' ? '2px solid #10B981' : '1px solid #E2E8F0',
                  background: paypalMode === 'LIVE' ? '#ECFDF5' : '#F8FAFC',
                  color: paypalMode === 'LIVE' ? '#065F46' : '#64748B',
                }}
              >
                ⚡ Live Production
              </button>
            </div>
          </div>

          {/* Client ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Client ID
            </label>
            <input
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              placeholder="e.g. A21AAK7u..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Client Secret */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Client Secret
              </label>
              <button
                type="button"
                onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                {showPaypalSecret ? <EyeOff size={14} /> : <Eye size={14} />} {showPaypalSecret ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showPaypalSecret ? 'text' : 'password'}
              value={paypalSecret}
              onChange={(e) => setPaypalSecret(e.target.value)}
              placeholder="e.g. EL80M..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Webhook ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Webhook ID (Optional for event verification)
            </label>
            <input
              type="text"
              value={paypalWebhookId}
              onChange={(e) => setPaypalWebhookId(e.target.value)}
              placeholder="e.g. 4JH392817..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Webhook Endpoint Copy */}
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>Webhook URL:</strong> {siteOrigin}/api/webhooks/paypal
            </div>
            <button
              type="button"
              onClick={() => handleCopyWebhook(`${siteOrigin}/api/webhooks/paypal`)}
              className="btn-3d-secondary"
              style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Copy size={12} /> {copiedUrl === `${siteOrigin}/api/webhooks/paypal` ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Test Ping Diagnostic Box */}
          {paypalTestResult && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: paypalTestResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1.5px solid ${paypalTestResult.success ? '#10B981' : '#F87171'}`,
                color: paypalTestResult.success ? '#065F46' : '#991B1B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {paypalTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <strong>{paypalTestResult.success ? 'PayPal Connection Active' : 'PayPal Test Failed'}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4 }}>{paypalTestResult.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 10 }}>
            <button
              type="button"
              onClick={handleTestPaypal}
              disabled={testingPaypal}
              className="btn-3d-secondary"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {testingPaypal ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} color="#0070BA" />}
              {testingPaypal ? 'Pinging PayPal...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSavePaypal}
              disabled={savingGateway === 'PAYPAL'}
              className="btn-3d"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {savingGateway === 'PAYPAL' ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {savingGateway === 'PAYPAL' ? 'Saving...' : 'Save PayPal Config'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
