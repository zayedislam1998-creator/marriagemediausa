'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { firebaseRegister } from '@/lib/firebase/authService';
import {
  COUNTRIES,
  US_STATES,
  BANGLADESH_DIVISIONS,
  CANADA_PROVINCES,
  UK_REGIONS,
  AUSTRALIA_STATES,
  getDialCodeForCountry,
} from '@/lib/geo/locations';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Primary Account Fields
  const [profileCreatedFor, setProfileCreatedFor] = useState('Self');
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cascading Geolocation Fields
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const [selectedSubdivision, setSelectedSubdivision] = useState('New York');
  const [selectedCity, setSelectedCity] = useState('New York City');
  const [customSubdivision, setCustomSubdivision] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Phone number state
  const dialCode = useMemo(() => getDialCodeForCountry(selectedCountryCode), [selectedCountryCode]);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Admin passcode expandable
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  // Terms and UI state
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active country details
  const currentCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
  }, [selectedCountryCode]);

  // Subdivisions options based on country
  const subdivisions = useMemo(() => {
    if (selectedCountryCode === 'US') return US_STATES;
    if (selectedCountryCode === 'BD') return BANGLADESH_DIVISIONS.map((d) => ({ code: d.division, name: d.division, cities: [] }));
    if (selectedCountryCode === 'CA') return CANADA_PROVINCES;
    if (selectedCountryCode === 'GB') return UK_REGIONS;
    if (selectedCountryCode === 'AU') return AUSTRALIA_STATES;
    return [];
  }, [selectedCountryCode]);

  // Cities/Districts options based on country & selected subdivision
  const cities = useMemo(() => {
    if (selectedCountryCode === 'US') {
      const match = US_STATES.find((s) => s.name === selectedSubdivision || s.code === selectedSubdivision);
      return match ? match.cities : [];
    }
    if (selectedCountryCode === 'BD') {
      const match = BANGLADESH_DIVISIONS.find((d) => d.division === selectedSubdivision);
      return match ? match.districts.map((dist) => dist.name) : [];
    }
    if (selectedCountryCode === 'CA') {
      const match = CANADA_PROVINCES.find((p) => p.name === selectedSubdivision || p.code === selectedSubdivision);
      return match ? match.cities : [];
    }
    if (selectedCountryCode === 'GB') {
      const match = UK_REGIONS.find((r) => r.name === selectedSubdivision || r.code === selectedSubdivision);
      return match ? match.cities : [];
    }
    if (selectedCountryCode === 'AU') {
      const match = AUSTRALIA_STATES.find((s) => s.name === selectedSubdivision || s.code === selectedSubdivision);
      return match ? match.cities : [];
    }
    return [];
  }, [selectedCountryCode, selectedSubdivision]);

  // Handle Country Change
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    if (countryCode === 'US') {
      setSelectedSubdivision('New York');
      setSelectedCity('New York City (Manhattan)');
    } else if (countryCode === 'BD') {
      setSelectedSubdivision('Dhaka');
      setSelectedCity('Dhaka');
    } else if (countryCode === 'CA') {
      setSelectedSubdivision('Ontario');
      setSelectedCity('Toronto');
    } else if (countryCode === 'GB') {
      setSelectedSubdivision('Greater London');
      setSelectedCity('Central London');
    } else if (countryCode === 'AU') {
      setSelectedSubdivision('New South Wales');
      setSelectedCity('Sydney');
    } else {
      setSelectedSubdivision('');
      setSelectedCity('');
      setCustomSubdivision('');
      setCustomCity('');
    }
  };

  // Handle Subdivision Change
  const handleSubdivisionChange = (subdivisionName: string) => {
    setSelectedSubdivision(subdivisionName);
    if (selectedCountryCode === 'US') {
      const match = US_STATES.find((s) => s.name === subdivisionName || s.code === subdivisionName);
      if (match && match.cities.length > 0) setSelectedCity(match.cities[0]);
    } else if (selectedCountryCode === 'BD') {
      const match = BANGLADESH_DIVISIONS.find((d) => d.division === subdivisionName);
      if (match && match.districts.length > 0) setSelectedCity(match.districts[0].name);
    } else if (selectedCountryCode === 'CA') {
      const match = CANADA_PROVINCES.find((p) => p.name === subdivisionName || p.code === subdivisionName);
      if (match && match.cities.length > 0) setSelectedCity(match.cities[0]);
    } else if (selectedCountryCode === 'GB') {
      const match = UK_REGIONS.find((r) => r.name === subdivisionName || r.code === subdivisionName);
      if (match && match.cities.length > 0) setSelectedCity(match.cities[0]);
    } else if (selectedCountryCode === 'AU') {
      const match = AUSTRALIA_STATES.find((s) => s.name === subdivisionName || s.code === subdivisionName);
      if (match && match.cities.length > 0) setSelectedCity(match.cities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError(null);

    const emailTrimmed = email.trim().toLowerCase();
    const fullNameTrimmed = fullName.trim();
    const cleanPhone = phoneNumber.trim();

    if (!emailTrimmed || !password || !fullNameTrimmed) {
      setRegError('Please provide your full name, email address, and a secure password.');
      setIsSubmitting(false);
      return;
    }

    if (!agreedToTerms) {
      setRegError('Please accept the Islamic matrimony terms to continue.');
      setIsSubmitting(false);
      return;
    }

    const finalState = currentCountry.hasSubdivisions ? selectedSubdivision : customSubdivision;
    const finalCity = currentCountry.hasSubdivisions ? selectedCity : customCity;
    const fullPhone = `${dialCode} ${cleanPhone}`;
    const lookingFor = gender === 'FEMALE' ? 'MALE' : 'FEMALE';

    try {
      const serverRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullNameTrimmed,
          email: emailTrimmed,
          phoneNumber: fullPhone,
          password,
          gender,
          lookingFor,
          country: currentCountry.name,
          stateProvince: finalState,
          city: finalCity,
          profileCreatedFor,
          adminPasscode: adminPasscode.trim(),
        }),
      });

      const serverData = await serverRes.json();

      if (serverRes.ok && serverData.success) {
        try {
          const assignedRole = adminPasscode.trim() === 'MB-ADMIN-2026' ? 'SUPER_ADMIN' : 'MEMBER';
          await firebaseRegister(emailTrimmed, password, fullNameTrimmed, gender, assignedRole);
        } catch {
          // Secondary fallback
        }

        if (serverData.user?.role === 'SUPER_ADMIN') {
          window.location.href = '/admin?welcome=admin';
        } else {
          window.location.href = '/dashboard?welcome=new';
        }
        return;
      }

      setRegError(serverData.error || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    } catch {
      setRegError('Network error during registration. Please verify your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 75%)',
      }}
    >
      <AppHeader />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
            margin: '0 auto',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(6, 78, 59, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.25fr)',
            background: '#FFFFFF',
          }}
          className="auth-unified-card"
        >
          {/* ============================================================
              LEFT PANEL: UNIFIED DARK EMERALD BRAND SHOWCASE
             ============================================================ */}
          <div
            style={{
              background: 'linear-gradient(150deg, #064E3B 0%, #043D2E 45%, #022C22 100%)',
              padding: '40px 32px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background vector rings */}
            <div
              style={{
                position: 'absolute',
                bottom: -50,
                right: -50,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 170,
                height: 170,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Logo in Clean White Pill */}
              <div style={{ marginBottom: 26 }}>
                <Link href="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: 12,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src="/logo.png"
                      alt="Marriage Media USA"
                      style={{ height: 32, width: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                </Link>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Join Our Matrimonial Network
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                Complete half your deen with peace of mind
              </h1>

              <p style={{ fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.55, margin: '0 0 26px 0', opacity: 0.9 }}>
                Join over 15,400 practicing Muslim brothers and sisters with comprehensive 85+ attribute biodatas and zero casual dating.
              </p>

              {/* 3 Translucent Feature Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#34D399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Comprehensive 85+ Attributes
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                      Deen, Mazhab, prayers, education, and career details
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: 'rgba(239, 68, 68, 0.25)',
                      color: '#F87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Purdah Modesty Photo Shield
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                      Blurred by default with 24px Gaussian filter
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: 'rgba(59, 130, 246, 0.25)',
                      color: '#60A5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Free Member Registration
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#A7F3D0', marginTop: 1 }}>
                      Explore profiles and upgrade packages anytime
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.725rem', color: 'rgba(209, 250, 229, 0.65)', marginTop: 20, position: 'relative', zIndex: 1 }}>
              Marriage Media USA • Sacred Matrimonial Portal
            </div>
          </div>

          {/* ============================================================
              RIGHT PANEL: COMPACT, HIGH-DENSITY REGISTRATION FORM
             ============================================================ */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '30px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Switcher Tab: Sign In vs Create Account */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#F1F5F9',
                borderRadius: 12,
                padding: 4,
                marginBottom: 14,
                border: '1px solid #E2E8F0',
              }}
            >
              <Link
                href="/login"
                style={{
                  padding: '8px 14px',
                  borderRadius: 9,
                  textAlign: 'center',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                Sign In
              </Link>
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: 9,
                  background: '#FFFFFF',
                  color: '#065F46',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  cursor: 'default',
                }}
              >
                Create Account
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Member Registration
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Create your account
              </h2>
              <p style={{ fontSize: '0.785rem', color: '#64748B', marginTop: 2, margin: 0 }}>
                Quick, free registration for practicing Muslims
              </p>
            </div>

            {/* Error Alert */}
            {regError && (
              <div
                style={{
                  background: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.785rem',
                  color: '#BE123C',
                  marginBottom: 12,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {/* Row 1: Profile For (Left) + Candidate Gender (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Profile Created For
                  </label>
                  <select
                    value={profileCreatedFor}
                    onChange={(e) => setProfileCreatedFor(e.target.value)}
                    style={{
                      height: 36,
                      padding: '0 10px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.8rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  >
                    <option value="Self">Self (My own)</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Relative">Relative</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Candidate Gender
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, height: 36 }}>
                    <button
                      type="button"
                      onClick={() => setGender('FEMALE')}
                      style={{
                        borderRadius: 8,
                        border: gender === 'FEMALE' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                        background: gender === 'FEMALE' ? '#ECFDF5' : '#FFFFFF',
                        color: gender === 'FEMALE' ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      🧕 Bride
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('MALE')}
                      style={{
                        borderRadius: 8,
                        border: gender === 'MALE' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                        background: gender === 'MALE' ? '#ECFDF5' : '#FFFFFF',
                        color: gender === 'MALE' ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      🧔 Groom
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Full Legal Name (Left) + Email Address (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Full Legal Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter candidate's name"
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 10px 0 32px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.8rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                    <User size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 10px 0 32px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.8rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                    <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>
              </div>

              {/* Row 3: Cascading Geolocation (Country, State/Division, City/District) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Country
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    style={{
                      height: 36,
                      padding: '0 6px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.785rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    {currentCountry.hasSubdivisions ? currentCountry.subdivisionLabel : 'State / Region'}
                  </label>
                  {currentCountry.hasSubdivisions ? (
                    <select
                      value={selectedSubdivision}
                      onChange={(e) => handleSubdivisionChange(e.target.value)}
                      style={{
                        height: 36,
                        padding: '0 6px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.785rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    >
                      {subdivisions.map((s) => (
                        <option key={s.code || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customSubdivision}
                      onChange={(e) => setCustomSubdivision(e.target.value)}
                      placeholder="State / Region"
                      style={{
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.785rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    {selectedCountryCode === 'BD' ? 'District' : 'City'}
                  </label>
                  {currentCountry.hasSubdivisions && cities.length > 0 ? (
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      style={{
                        height: 36,
                        padding: '0 6px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.785rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="City / Area"
                      style={{
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.785rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Row 4: Phone Number with Dial Code (Left) + Password (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Phone Number
                  </label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div
                      style={{
                        height: 36,
                        padding: '0 6px',
                        background: '#F1F5F9',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span>{dialCode}</span>
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone number"
                        style={{
                          width: '100%',
                          height: 36,
                          padding: '0 8px 0 26px',
                          borderRadius: 8,
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.8rem',
                          outline: 'none',
                          background: '#FFFFFF',
                          color: '#0F172A',
                        }}
                      />
                      <Phone size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1E293B' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 28px 0 28px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.8rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                    <Lock size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 5: Single Compact Line Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.725rem',
                  color: '#475569',
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ accentColor: '#059669', width: 14, height: 14 }}
                />
                <span>I affirm sincere intentions for blessed Islamic marriage (Nikkah).</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d"
                style={{
                  width: '100%',
                  height: 40,
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  marginTop: 2,
                }}
              >
                {isSubmitting ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Free Account <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign In */}
            <div style={{ marginTop: 14, textAlign: 'center', fontSize: '0.775rem', color: '#64748B' }}>
              Already registered?{' '}
              <Link href="/login" style={{ color: '#059669', fontWeight: 800, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>

            {/* Subtle Staff Passcode Toggle */}
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.685rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <KeyRound size={11} /> Have staff passcode?
              </button>
              {showAdminPasscode && (
                <div style={{ marginTop: 6 }}>
                  <input
                    type="password"
                    name="adminPasscode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter authorization code"
                    style={{
                      width: '100%',
                      height: 32,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.75rem',
                      background: '#FFFBEB',
                      color: '#92400E',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
