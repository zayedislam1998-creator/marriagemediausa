'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { firebaseRegister } from '@/lib/firebase/authService';
import { User, Mail, Phone, Lock, Sparkles, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function RegisterPage() {
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [lookingFor, setLookingFor] = useState<'MALE' | 'FEMALE'>('MALE');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string);
    const fullName = (formData.get('fullName') as string)?.trim();
    const genderVal = (formData.get('gender') as string) || gender;
    const adminPass = (formData.get('adminPasscode') as string)?.trim();

    if (!email || !password) {
      setRegError('Please provide a valid email and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const assignedRole = adminPass === 'MB-ADMIN-2026' ? 'SUPER_ADMIN' : 'MEMBER';
      const res = await firebaseRegister(email, password, fullName, genderVal as any, assignedRole);
      if (res.success) {
        window.location.href = assignedRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
      } else {
        setRegError(res.error || 'Registration failed. Please check your details.');
        setIsSubmitting(false);
      }
    } catch {
      setRegError('Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl) var(--space-md)',
      }}
    >
      <div
        className="card-3d"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '36px 32px',
          margin: '0 auto',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image
              src="/images/logo.png"
              alt="MarriageMediaUSA.com"
              width={170}
              height={50}
              style={{ height: 'auto', maxHeight: 44, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 14, marginBottom: 4 }}>
            Create New Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Join North America & Global Halal Matrimonial Network
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(15, 23, 42, 0.05)',
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href="/login"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </Link>
          <button
            type="button"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: '#fff',
              color: 'var(--emerald-800)',
              fontWeight: 800,
              fontSize: '0.875rem',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
              cursor: 'default',
            }}
          >
            New Registration
          </button>
        </div>

        {/* Error Alert */}
        {regError && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.85rem',
              color: '#BE123C',
              marginBottom: 20,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{regError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full Name */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Full Legal Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Dr. Ayesha Siddiqa"
                className="input-3d"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <User
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
            </div>
          </div>

          {/* Email & Phone grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="input-3d"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border-medium)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#fff',
                  }}
                />
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="+1-202-555-0199"
                  className="input-3d"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border-medium)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#fff',
                  }}
                />
                <Phone
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Password (Minimum 6 Characters)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="input-3d"
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 42px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <Lock
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Gender & Looking for selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                I am a (Gender)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setGender('FEMALE');
                    setLookingFor('MALE');
                  }}
                  style={{
                    padding: '9px 6px',
                    borderRadius: 10,
                    border: gender === 'FEMALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-medium)',
                    background: gender === 'FEMALE' ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                    color: gender === 'FEMALE' ? 'var(--emerald-800)' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  🧕 Female
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender('MALE');
                    setLookingFor('FEMALE');
                  }}
                  style={{
                    padding: '9px 6px',
                    borderRadius: 10,
                    border: gender === 'MALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-medium)',
                    background: gender === 'MALE' ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                    color: gender === 'MALE' ? 'var(--emerald-800)' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  👨‍💼 Male
                </button>
              </div>
              <input type="hidden" name="gender" value={gender} />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Seeking a
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setLookingFor('MALE')}
                  style={{
                    padding: '9px 6px',
                    borderRadius: 10,
                    border: lookingFor === 'MALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-medium)',
                    background: lookingFor === 'MALE' ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                    color: lookingFor === 'MALE' ? 'var(--emerald-800)' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  👨‍💼 Groom (Male)
                </button>
                <button
                  type="button"
                  onClick={() => setLookingFor('FEMALE')}
                  style={{
                    padding: '9px 6px',
                    borderRadius: 10,
                    border: lookingFor === 'FEMALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-medium)',
                    background: lookingFor === 'FEMALE' ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                    color: lookingFor === 'FEMALE' ? 'var(--emerald-800)' : 'var(--text-body)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  🧕 Bride (Female)
                </button>
              </div>
              <input type="hidden" name="lookingFor" value={lookingFor} />
            </div>
          </div>

          {/* Secure Administrator Registration Accordion */}
          <div
            style={{
              borderRadius: 12,
              border: showAdminPasscode ? '1.5px solid rgba(217, 119, 6, 0.5)' : '1px solid var(--border-subtle)',
              background: showAdminPasscode ? 'rgba(254, 243, 199, 0.3)' : 'rgba(15, 23, 42, 0.02)',
              padding: '12px 14px',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              onClick={() => setShowAdminPasscode(!showAdminPasscode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={16} style={{ color: showAdminPasscode ? 'var(--gold-600)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  🔒 Administrator Setup Passcode (Optional)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald-700)' }}>
                {showAdminPasscode ? 'Hide' : 'Configure'}
              </span>
            </div>

            {showAdminPasscode && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(217, 119, 6, 0.3)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                  If you are deploying this platform as the Chief Executive Owner, enter the secure setup passcode:
                </p>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="adminPasscode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Passcode: MB-ADMIN-2026"
                    className="input-3d"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--gold-500)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#fff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setAdminPasscode('MB-ADMIN-2026')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(217, 119, 6, 0.1)',
                      border: '1px solid var(--gold-500)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--gold-700)',
                      cursor: 'pointer',
                    }}
                  >
                    Insert Passcode
                  </button>
                </div>
                <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--emerald-800)', fontWeight: 600 }}>
                  ✓ Providing this passcode immediately assigns the SUPER_ADMIN executive role.
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-3d"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: 6,
            }}
          >
            {isSubmitting ? (
              'Creating Account...'
            ) : (
              <>
                Complete Registration <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Halal Privacy Guarantee */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--emerald-600)' }} />
          <span>Strict Islamic Modesty & 256-Bit SSL Data Encryption</span>
        </div>
      </div>
    </div>
  );
}
