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
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  Heart,
  Globe,
  CheckCircle2,
  Shield,
  BookOpen,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Primary Account Fields
  const [profileCreatedFor, setProfileCreatedFor] = useState('Self');
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [lookingFor, setLookingFor] = useState<'MALE' | 'FEMALE'>('MALE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cascading Geolocation Fields
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const [selectedSubdivision, setSelectedSubdivision] = useState('New York');
  const [selectedCity, setSelectedCity] = useState('New York City');
  const [selectedThana, setSelectedThana] = useState('');
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

  // Cities options based on country & selected subdivision
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

  // Thanas options (Bangladesh specific)
  const thanas = useMemo(() => {
    if (selectedCountryCode !== 'BD') return [];
    const divMatch = BANGLADESH_DIVISIONS.find((d) => d.division === selectedSubdivision);
    if (!divMatch) return [];
    const distMatch = divMatch.districts.find((d) => d.name === selectedCity);
    return distMatch ? distMatch.thanas : [];
  }, [selectedCountryCode, selectedSubdivision, selectedCity]);

  // Handle Country Change
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    if (countryCode === 'US') {
      setSelectedSubdivision('New York');
      setSelectedCity('New York City');
    } else if (countryCode === 'BD') {
      setSelectedSubdivision('Dhaka');
      setSelectedCity('Dhaka');
      setSelectedThana('Dhanmondi');
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

  // Handle Gender Change
  const handleGenderChange = (newGender: 'FEMALE' | 'MALE') => {
    setGender(newGender);
    setLookingFor(newGender === 'FEMALE' ? 'MALE' : 'FEMALE');
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

    // Determine final location values
    const finalState = currentCountry.hasSubdivisions ? selectedSubdivision : customSubdivision;
    const finalCity = currentCountry.hasSubdivisions
      ? selectedCountryCode === 'BD' && selectedThana
        ? `${selectedThana}, ${selectedCity}`
        : selectedCity
      : customCity;
    const fullPhone = `${dialCode} ${cleanPhone}`;

    try {
      // 1. Send registration to Next.js API / PostgreSQL
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
        // Also register with client Firebase for real-time capabilities
        try {
          const assignedRole = adminPasscode.trim() === 'MB-ADMIN-2026' ? 'SUPER_ADMIN' : 'MEMBER';
          await firebaseRegister(emailTrimmed, password, fullNameTrimmed, gender, assignedRole);
        } catch {
          // Secondary sync
        }

        // Redirect newly registered member to dashboard with standard Free status
        if (serverData.user?.role === 'SUPER_ADMIN') {
          window.location.href = '/admin?welcome=admin';
        } else {
          window.location.href = '/dashboard?welcome=new';
        }
        return;
      }

      setRegError(serverData.error || 'Registration failed. Please check your information and try again.');
      setIsSubmitting(false);
    } catch {
      setRegError('Network error during registration. Please verify your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at top, #EDFDF5 0%, #F4F7FA 70%)',
      }}
    >
      {/* 1. Official Platform Header */}
      <AppHeader />

      {/* 2. Main Executive 2-Column Registration Workspace */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'start',
          }}
        >
          {/* ============================================================
              LEFT COLUMN: PLATFORM MEMBERSHIP BENEFITS & PILLARS
             ============================================================ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              padding: '16px 8px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 30,
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#047857',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                <Sparkles size={15} />
                <span>Free Member Registration</span>
              </div>

              <h1
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.25,
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Join Over 15,400 Practicing Muslims Worldwide
              </h1>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Create your matrimonial profile today. Browse verified biodatas across North America, the UK, Australia, and Bangladesh with complete privacy and zero casual dating.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: '#FFFFFF',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    Comprehensive 85+ Attribute Biodatas
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    Religious practice, Mazhab, prayers, educational degrees, profession, and family background clearly outlined.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: '#FFFFFF',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    Purdah Modesty Photo Shield
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    Choose to blur your photos with server-side 24px Gaussian blur until both families mutually agree to view.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: '#FFFFFF',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Globe size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    USA & International Diaspora Communities
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    Find practicing suitors living in New York, Texas, California, Chicago, Toronto, London, Sydney, or Dhaka.
                  </p>
                </div>
              </div>
            </div>

            {/* Free Membership Guarantee Box */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <CheckCircle2 size={22} style={{ color: '#059669', flexShrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>No Mandatory Upgrades:</strong> Registration is free. You can create your complete biodata, search profiles, and choose a subscription tier later if you wish.
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: REGISTRATION CARD WITH CASCADING GEO
             ============================================================ */}
          <div
            className="card-3d"
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '36px 32px',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              width: '100%',
            }}
          >
            {/* Card Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Create Free Account
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 4, margin: 0 }}>
                Join the sacred matrimonial network in under 2 minutes
              </p>
            </div>

            {/* Switch Tab: Sign In vs Create Account */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#F1F5F9',
                borderRadius: 12,
                padding: 4,
                marginBottom: 20,
              }}
            >
              <Link
                href="/login"
                style={{
                  padding: '10px 16px',
                  borderRadius: 9,
                  textAlign: 'center',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Sign In
              </Link>
              <button
                type="button"
                style={{
                  padding: '10px 16px',
                  borderRadius: 9,
                  background: '#FFFFFF',
                  color: '#065F46',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  cursor: 'default',
                }}
              >
                Create Account
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
                  marginBottom: 18,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile Created For */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                  Creating Profile For
                </label>
                <select
                  value={profileCreatedFor}
                  onChange={(e) => setProfileCreatedFor(e.target.value)}
                  className="input-3d"
                  style={{
                    padding: '11px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#0F172A',
                  }}
                >
                  <option value="Self">Self (My own biodata)</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend / Relative">Friend / Relative</option>
                </select>
              </div>

              {/* Gender & Seeking Toggle Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                    Candidate Gender
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('FEMALE')}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        border: gender === 'FEMALE' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                        background: gender === 'FEMALE' ? '#ECFDF5' : '#FFFFFF',
                        color: gender === 'FEMALE' ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🧕 Bride
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('MALE')}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        border: gender === 'MALE' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                        background: gender === 'MALE' ? '#ECFDF5' : '#FFFFFF',
                        color: gender === 'MALE' ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🧔 Groom
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                    Seeking Partner
                  </label>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      height: 42,
                    }}
                  >
                    <Heart size={14} style={{ color: '#059669' }} />
                    <span>{lookingFor === 'MALE' ? '🧔 Groom (Brother)' : '🧕 Bride (Sister)'}</span>
                  </div>
                </div>
              </div>

              {/* Full Legal Name */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                  Full Legal Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter candidate's full legal name"
                    className="input-3d"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  />
                  <User
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
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
                    className="input-3d"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  />
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                </div>
              </div>

              {/* ============================================================
                  CASCADING GEOGRAPHIC LOCATION ENGINE
                 ============================================================ */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0F172A' }}>
                    Current Residence & Location
                  </span>
                </div>

                {/* Country Dropdown */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    Country
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="input-3d"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.875rem',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* State / Division and City / District Grid */}
                {currentCountry.hasSubdivisions ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {/* Subdivision (State / Division / Province) */}
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        {currentCountry.subdivisionLabel}
                      </label>
                      <select
                        value={selectedSubdivision}
                        onChange={(e) => {
                          setSelectedSubdivision(e.target.value);
                          if (selectedCountryCode === 'BD') {
                            const div = BANGLADESH_DIVISIONS.find((d) => d.division === e.target.value);
                            if (div && div.districts.length > 0) {
                              setSelectedCity(div.districts[0].name);
                              setSelectedThana(div.districts[0].thanas[0] || '');
                            }
                          }
                        }}
                        className="input-3d"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.85rem',
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
                    </div>

                    {/* City or District */}
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        {selectedCountryCode === 'BD' ? 'District' : 'City / Metropolitan Area'}
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          if (selectedCountryCode === 'BD') {
                            const div = BANGLADESH_DIVISIONS.find((d) => d.division === selectedSubdivision);
                            const dist = div?.districts.find((d) => d.name === e.target.value);
                            setSelectedThana(dist?.thanas[0] || '');
                          }
                        }}
                        className="input-3d"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.85rem',
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
                    </div>
                  </div>
                ) : (
                  /* Custom text inputs for countries without static catalog */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        value={customSubdivision}
                        onChange={(e) => setCustomSubdivision(e.target.value)}
                        placeholder="Enter state or region"
                        className="input-3d"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.85rem',
                          background: '#FFFFFF',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        City / Municipality
                      </label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Enter city"
                        className="input-3d"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.85rem',
                          background: '#FFFFFF',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bangladesh Thana / Upazila (Only if BD) */}
                {selectedCountryCode === 'BD' && thanas.length > 0 && (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Thana / Upazila
                    </label>
                    <select
                      value={selectedThana}
                      onChange={(e) => setSelectedThana(e.target.value)}
                      className="input-3d"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    >
                      {thanas.map((th) => (
                        <option key={th} value={th}>
                          {th}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Phone Number with Auto-Dial Code Prefix */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      padding: '11px 14px',
                      background: '#F1F5F9',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <span>{currentCountry.flag}</span>
                    <span>{dialCode}</span>
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="input-3d"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#0F172A',
                      }}
                    />
                    <Phone
                      size={17}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password (min 6 characters)"
                    className="input-3d"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  />
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
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
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Administrative Passcode Drawer (Expandable) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <KeyRound size={13} />
                  <span>Have an administrative authorization passcode?</span>
                </button>

                {showAdminPasscode && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="password"
                      name="adminPasscode"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter administrator authorization code"
                      className="input-3d"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.825rem',
                        background: '#FFFBEB',
                        color: '#92400E',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Terms and Halal Certification Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: '0.785rem',
                  color: '#475569',
                  lineHeight: 1.4,
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ accentColor: '#059669', width: 16, height: 16, marginTop: 2 }}
                />
                <span>
                  I affirm that all information provided is accurate and that I am registering with sincere intentions for blessed Islamic marriage (Nikkah).
                </span>
              </label>

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
                  opacity: isSubmitting ? 0.75 : 1,
                  marginTop: 6,
                }}
              >
                {isSubmitting ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Free Account & Continue <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Footer */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: '0.75rem',
                color: '#64748B',
              }}
            >
              <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
              <span>100% Islamic Purdah & Verified Privacy Guarantee</span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Official Platform Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <BottomNav />
    </div>
  );
}
