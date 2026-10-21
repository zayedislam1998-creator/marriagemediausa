'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight,
  Coins,
  Award,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Fingerprint,
} from 'lucide-react';

export interface PaymentItem {
  type: 'MEMBERSHIP_SUBSCRIPTION' | 'WALLET_TOPUP';
  packageId?: number;
  title: string;
  price: number;
  credits: number;
  durationMonths?: number;
  badgeTitle?: string;
  features?: string[];
}

interface MemberPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userProfile?: any;
  item: PaymentItem | null;
  onSuccess: (creditsAdded: number, newTier?: string) => void;
}

export function MemberPaymentModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  userProfile,
  item,
  onSuccess,
}: MemberPaymentModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  // Auto-populate verified profile data from biodata
  const profileToken =
    userProfile?.profileId ||
    userProfile?.profile_id ||
    userProfile?.id ||
    `MB-${userId.slice(-6).toUpperCase()}`;

  const fullName =
    userProfile?.fullName ||
    userProfile?.full_name ||
    userProfile?.name ||
    userEmail.split('@')[0];

  const phoneNumber =
    userProfile?.guardianPhone ||
    userProfile?.guardian_phone ||
    userProfile?.phoneNumber ||
    userProfile?.phone ||
    '+880 1700-000000';

  const country =
    userProfile?.countryLivingIn ||
    userProfile?.country_living_in ||
    userProfile?.country ||
    'Bangladesh';

  const stateProvince =
    userProfile?.stateProvince ||
    userProfile?.state_province ||
    userProfile?.state ||
    'Dhaka';

  const city =
    userProfile?.city ||
    'Uttara';

  const postalCode =
    userProfile?.postalCode ||
    userProfile?.postal_code ||
    '1230';

  const locationDisplay = [city, stateProvince, country].filter(Boolean).join(', ');

  const handleCheckout = async () => {
    setProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      userId,
      userEmail,
      type: item.type,
      packageId: item.packageId,
      credits: item.credits,
      customAmount: item.price,
      // Verified profile auto-fill fields
      profileToken,
      payerName: fullName,
      payerEmail: userEmail,
      payerPhone: phoneNumber,
      city,
      stateProvince,
      country,
      postalCode,
    };

    try {
      if (selectedGateway === 'STRIPE') {
        const res = await fetch('/api/payments/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to initiate Stripe checkout');
        }

        if (data.url) {
          window.location.href = data.url;
          return;
        }

        throw new Error('No checkout URL received from Stripe gateway.');
      } else if (selectedGateway === 'PAYPAL') {
        // Step 1: Create Order
        const orderRes = await fetch('/api/payments/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const orderData = await orderRes.json();
        if (!orderData.success) {
          throw new Error(orderData.error || 'Failed to create PayPal order');
        }

        const approveLink = orderData.links?.find(
          (l: any) => l.rel === 'approve' || l.rel === 'payer-action'
        )?.href;

        if (approveLink) {
          window.location.href = approveLink;
          return;
        }

        throw new Error('No approval redirect link received from PayPal gateway.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="card-3d"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #E2E8F0',
          position: 'relative',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
          aria-label="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#059669',
                background: '#ECFDF5',
                padding: '3px 8px',
                borderRadius: 12,
                border: '1px solid #A7F3D0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Lock size={11} /> 100% Halal & Verified Checkout
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Zero Hidden Fees</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
            {item.type === 'MEMBERSHIP_SUBSCRIPTION' ? 'Upgrade Membership Plan' : 'Purchase Contact Credits'}
          </h2>
        </div>

        {/* 1. Item Summary Card */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{item.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                {item.type === 'MEMBERSHIP_SUBSCRIPTION'
                  ? `${item.durationMonths} Month Duration • ${item.credits} Unlocks`
                  : `${item.credits} Direct Candidate & Wali Phone Unlocks`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669' }}>${item.price}</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>USD (One-time)</div>
            </div>
          </div>
        </div>

        {/* 2. Auto-Populated Biodata Verification Card */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            border: '1.5px solid #A7F3D0',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={16} color="#059669" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Biodata & Payer Info (Auto-Populated)
              </span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#047857',
                background: '#D1FAE5',
                padding: '2px 8px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Fingerprint size={12} />
              Token #{profileToken}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>PAYER NAME</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{fullName}</span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>WHATSAPP / PHONE</span>
              <span style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={11} color="#059669" />
                {phoneNumber}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>BILLING EMAIL</span>
              <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={11} color="#64748B" />
                {userEmail}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>RESIDENCE LOCATION</span>
              <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} color="#64748B" />
                {locationDisplay}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #A7F3D0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={13} color="#059669" />
            <span style={{ fontSize: '0.72rem', color: '#047857' }}>
              Auto-linked directly to your biodata. No repetitive manual typing required.
            </span>
          </div>
        </div>

        {/* 3. Payment Gateway Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>
            Select Payment Method:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Stripe Option */}
            <div
              onClick={() => setSelectedGateway('STRIPE')}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: selectedGateway === 'STRIPE' ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                background: selectedGateway === 'STRIPE' ? '#EEF2FF' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#6366F1',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                    }}
                  >
                    S
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#1E1B4B' }}>Stripe</strong>
                </div>
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    border: selectedGateway === 'STRIPE' ? '5px solid #6366F1' : '1.5px solid #CBD5E1',
                    background: '#fff',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Cards, Apple & Google Pay (3DS2)</div>
            </div>

            {/* PayPal Option */}
            <div
              onClick={() => setSelectedGateway('PAYPAL')}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: selectedGateway === 'PAYPAL' ? '2px solid #0070BA' : '1.5px solid #E2E8F0',
                background: selectedGateway === 'PAYPAL' ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#0070BA',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                    }}
                  >
                    P
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#1E3A8A' }}>PayPal</strong>
                </div>
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    border: selectedGateway === 'PAYPAL' ? '5px solid #0070BA' : '1.5px solid #CBD5E1',
                    background: '#fff',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>PayPal Wallet & Pay in 4</div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              color: '#065F46',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Checkout Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={processing || Boolean(successMsg)}
          className="btn-3d"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background:
              selectedGateway === 'STRIPE'
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #0070BA, #003087)',
          }}
        >
          {processing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Connecting to {selectedGateway}...</span>
            </>
          ) : (
            <>
              <CreditCard size={18} />
              <span>Complete Payment (${item.price} USD)</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>
            🔒 256-bit SSL encrypted. Credits and package activate instantly upon payment confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
