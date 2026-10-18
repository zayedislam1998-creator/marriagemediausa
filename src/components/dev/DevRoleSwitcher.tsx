'use client';

import { useState } from 'react';
import { switchDevSeatAction, signOutAction } from '@/lib/auth/actions';
import { Shield, Sparkles, User, LogOut, ChevronUp, ChevronDown } from 'lucide-react';

interface DevRoleSwitcherProps {
  currentRole?: string;
  currentEmail?: string;
}

export function DevRoleSwitcher({ currentRole, currentEmail }: DevRoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSwitch = async (role: any, tier: any = 'FREE') => {
    setIsPending(true);
    try {
      await switchDevSeatAction(role, tier);
    } catch (e) {
      // Next.js redirect throws, which is expected
    } finally {
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await signOutAction();
    } catch (e) {
      // Next.js redirect
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 99999,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Floating Pill Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          color: '#F8FAFC',
          border: '1.5px solid #334155',
          borderRadius: 24,
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: currentRole ? 'var(--emerald-400)' : '#94A3B8',
          }}
        />
        <span>
          Seat: {currentRole || 'Guest'} {currentEmail ? `(${currentEmail})` : ''}
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expandable Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 0,
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: 14,
            padding: 12,
            border: '1.5px solid #334155',
            boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: 'var(--emerald-400)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderBottom: '1px solid #1E293B',
              paddingBottom: 6,
              marginBottom: 4,
            }}
          >
            ⚡ Fast RBAC Seat Switcher
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('SUPER_ADMIN')}
            style={seatBtnStyle}
          >
            👑 Super Admin (/admin)
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('EDITOR')}
            style={seatBtnStyle}
          >
            ✍️ Content Editor (/admin/cms)
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('MODERATOR')}
            style={seatBtnStyle}
          >
            🛡️ Trust Moderator (/admin/kyc)
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('MEMBER', 'GOLD')}
            style={seatBtnStyle}
          >
            🧕 Dr. Ayesha (Gold Member, /dashboard)
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('MEMBER', 'PLATINUM')}
            style={seatBtnStyle}
          >
            👨 Shahid (Platinum Member, /dashboard)
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSwitch('MEMBER', 'FREE')}
            style={seatBtnStyle}
          >
            🆓 Free Explorer (/dashboard)
          </button>

          {currentRole && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSignOut}
              style={{
                ...seatBtnStyle,
                background: '#450a0a',
                color: '#fca5a5',
                borderColor: '#991b1b',
                marginTop: 4,
              }}
            >
              <LogOut size={12} style={{ display: 'inline', marginRight: 4 }} />
              Sign Out (Guest)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const seatBtnStyle: React.CSSProperties = {
  background: '#1E293B',
  border: '1px solid #334155',
  color: '#E2E8F0',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
