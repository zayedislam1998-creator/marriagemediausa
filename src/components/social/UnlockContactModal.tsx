'use client';

import { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react';
import { AuthenticProfile } from '@/db/repository';
import { unlockContactAction } from '@/lib/social/actions';
import { UnlockedContactRecord } from '@/lib/social/credits';

interface UnlockContactModalProps {
  targetProfile: AuthenticProfile;
  isOpen: boolean;
  onClose: () => void;
  userCredits?: number;
  userTier?: string;
  initialUnlockedRecord?: UnlockedContactRecord | null;
}

export function UnlockContactModal({
  targetProfile,
  isOpen,
  onClose,
  userCredits = 25,
  userTier = 'SILVER',
  initialUnlockedRecord = null,
}: UnlockContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [unlockedRecord, setUnlockedRecord] = useState<UnlockedContactRecord | null>(
    initialUnlockedRecord
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number>(userCredits);

  if (!isOpen) return null;

  const handleUnlock = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await unlockContactAction(targetProfile.profile_id);
      if (res.success && res.record) {
        setUnlockedRecord(res.record);
        if (res.remainingCredits !== undefined) {
          setRemainingCredits(res.remainingCredits);
        }
      } else {
        setErrorMessage(res.error || 'Failed to unlock contact.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isFree = userTier === 'FREE' && remainingCredits <= 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          maxWidth: 520,
          width: '100%',
          padding: 'var(--space-2xl)',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-lg)',
              background: unlockedRecord ? 'var(--emerald-100)' : 'var(--gold-100)',
              color: unlockedRecord ? 'var(--emerald-700)' : 'var(--gold-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unlockedRecord ? <Unlock size={22} /> : <Lock size={22} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {unlockedRecord ? 'Contact Details Unlocked' : 'Unlock Suitor & Wali Contact'}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {targetProfile.full_name} (#{targetProfile.profile_id})
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--coral-50)',
              border: '1px solid var(--coral-200)',
              color: 'var(--coral-600)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 'var(--space-md)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {unlockedRecord ? (
          /* Unlocked Contact Details View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Guardian Wali Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                border: '1.5px solid var(--emerald-300)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-md) var(--space-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--emerald-900)' }}>
                  🛡️ Verified Wali (Guardian) Contact
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>
                  ✓ ID Verified
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                <strong>{unlockedRecord.guardianName}</strong> ({unlockedRecord.guardianRelation})
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--emerald-700)', marginTop: 4 }}>
                📞 {unlockedRecord.guardianPhone}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--emerald-800)', marginTop: 4 }}>
                ✓ An automated SMS notification has been dispatched to the Wali informing them of this matrimonial contact.
              </div>
            </div>

            {/* Suitor Direct Contact */}
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-md) var(--space-lg)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                Candidate Direct Coordinates
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: 4 }}>
                <Phone size={14} color="var(--emerald-600)" />
                <strong>Direct Phone:</strong> {unlockedRecord.directPhone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                <Mail size={14} color="var(--sapphire-600)" />
                <strong>Direct Email:</strong> {unlockedRecord.directEmail}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <a
                href={`tel:${unlockedRecord.directPhone}`}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Phone size={14} /> Call Suitor
              </a>
              <a
                href={`tel:${unlockedRecord.guardianPhone}`}
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ShieldCheck size={14} /> Call Wali
              </a>
            </div>
          </div>
        ) : (
          /* Lock Confirmation / Credit Deduct Screen */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
              Unlocking contact details reveals the candidate’s direct telephone number and verified Wali contact information. In compliance with Sunnah adab, an automated alert will be sent to the suitor’s guardian.
            </p>

            {/* Wallet Balance Box */}
            <div
              style={{
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Contact Unlock Wallet ({userTier})
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                  {remainingCredits >= 9000 ? 'Unlimited' : `${remainingCredits} Credits Available`}
                </div>
              </div>
              <span className="badge badge-sapphire" style={{ fontSize: '0.75rem' }}>
                Cost: 1 Credit
              </span>
            </div>

            {isFree ? (
              /* Upgrade Required prompt for Free accounts */
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '1.5px solid var(--gold-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--gold-800)', fontSize: '0.875rem' }}>
                  Upgrade Required to Unlock Contacts
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-900)' }}>
                  Free accounts cannot view suitor or Wali phone numbers. Upgrade to Silver ($2,000 for 25 unlocks) or Gold ($3,000 for 60 unlocks) to proceed.
                </div>
                <a href="/#pricing" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  View Membership Packages <ArrowRight size={14} />
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUnlock}
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Deducting Credit & Unlocking...' : 'Deduct 1 Credit & Unlock Contacts Now 🔓'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
