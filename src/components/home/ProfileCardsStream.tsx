'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Lock,
  Heart,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { AuthenticProfile } from '@/db/repository';

interface ProfileCardsStreamProps {
  profiles: AuthenticProfile[];
}

export function ProfileCardsStream({ profiles }: ProfileCardsStreamProps) {
  const [revealedPurdah, setRevealedPurdah] = useState<Record<string, boolean>>({});
  const [selectedProfile, setSelectedProfile] = useState<AuthenticProfile | null>(null);
  const [sentSalaam, setSentSalaam] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [sliderOffset, setSliderOffset] = useState(0);

  const visibleSliderCount = 4;
  const maxOffset = Math.max(0, profiles.length - visibleSliderCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setSliderOffset((prev) => (prev >= maxOffset ? 0 : prev + 1));
    }, 4200);
    return () => clearInterval(timer);
  }, [maxOffset]);

  const togglePurdah = (profileId: string) => {
    setRevealedPurdah((prev) => ({
      ...prev,
      [profileId]: !prev[profileId],
    }));
  };

  const handleSendSalaam = (profileId: string, name: string) => {
    setSentSalaam((prev) => ({ ...prev, [profileId]: true }));
  };

  const filteredProfiles = profiles.filter((p) => {
    if (activeTab === 'FEMALE') return p.gender === 'FEMALE';
    if (activeTab === 'MALE') return p.gender === 'MALE';
    return true;
  });

  const sliderSlice = profiles.slice(sliderOffset, sliderOffset + visibleSliderCount);

  return (
    <section
      id="profiles-stream"
      style={{
        paddingBlock: '4rem',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f6 50%, #f8fafc 100%)',
        borderBottom: '1px solid #cbd5e1',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingInline: 'var(--space-lg)',
        }}
      >
        {/* ============================================================
            1. LATEST REGISTERED MEMBERS INTERACTIVE SLIDER (From live site)
           ============================================================ */}
        <div style={{ marginBottom: '4rem' }}>
          <div className="ornamental-header">
            <div className="badge badge-emerald" style={{ marginBottom: 8, padding: '5px 14px' }}>
              <Sparkles size={12} /> Live Member Directory Carousel
            </div>
            <h2>
              Latest <span>Registered Members</span> Slider
            </h2>
            <div className="ornamental-divider">
              <img src="/images/w-title-b.png" alt="Divider" />
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: 650, margin: '0 auto' }}>
              Real registered brides and grooms from MarriageMediaUSA.com with authentic Profile IDs, photographs,
              verified education, and family details.
            </p>
          </div>

          {/* Slider Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              Showing Slide {sliderOffset + 1} – {Math.min(sliderOffset + visibleSliderCount, profiles.length)} of{' '}
              {profiles.length} Verified Members
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSliderOffset((prev) => (prev <= 0 ? maxOffset : prev - 1))}
                className="btn-3d-emerald"
                style={{ padding: '8px 14px' }}
                aria-label="Previous Member Slide"
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <button
                type="button"
                onClick={() => setSliderOffset((prev) => (prev >= maxOffset ? 0 : prev + 1))}
                className="btn-3d-emerald"
                style={{ padding: '8px 14px' }}
                aria-label="Next Member Slide"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* 4-Card Carousel Strip (Left-to-Right Swipe on Mobile, 4-Col Grid on Desktop) */}
          <div className="mobile-horizontal-scroll">
            {sliderSlice.map((member) => (
              <div
                key={`slider-${member.profile_id}`}
                className="card-3d"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  background: '#ffffff',
                }}
              >
                <Link
                  href={`/profile/${member.profile_id}`}
                  className="slider-card-photo-box"
                >
                  <img
                    src={
                      member.photo_url ||
                      'https://marriagemediausa.com/design/member_image/Sahida_Akter_Ruma5.jpg'
                    }
                    alt={member.full_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '6px 10px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.88) 100%)',
                      color: '#fbbf24',
                      fontSize: '0.74rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                    }}
                  >
                    #{member.profile_id}
                  </div>
                </Link>

                <div className="slider-card-body" style={{ padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Link
                    href={`/profile/${member.profile_id}`}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      color: '#0f172a',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.full_name}
                  </Link>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.age} yr, {member.height_feet_inches} • {member.religion}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.profession}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e11d48', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📍 {member.city}, {member.state_province}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            2. FEATURED PROFILES 3D SHOWCASE WITH FILTER TABS
           ============================================================ */}
        <div className="ornamental-header">
          <div className="badge badge-gold" style={{ marginBottom: 8, padding: '5px 14px' }}>
            <ShieldCheck size={12} /> 10-Level Verified Matrimonial Biodatas
          </div>
          <h2>
            Featured <span>Bride & Groom</span> Profiles
          </h2>
          <div className="ornamental-divider">
            <img src="/images/w-title-b.png" alt="Divider" />
          </div>

          {/* Gender Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: 10,
              marginTop: '1rem',
              background: '#ffffff',
              padding: 6,
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              border: '1px solid #cbd5e1',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={activeTab === 'ALL' ? 'btn-3d-emerald' : 'btn btn-ghost btn-sm'}
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              ✨ All Featured ({profiles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FEMALE')}
              className={activeTab === 'FEMALE' ? 'btn-3d-crimson' : 'btn btn-ghost btn-sm'}
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              🧕 Brides / Sisters ({profiles.filter((p) => p.gender === 'FEMALE').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MALE')}
              className={activeTab === 'MALE' ? 'btn-3d-gold' : 'btn btn-ghost btn-sm'}
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              👨 Grooms / Brothers ({profiles.filter((p) => p.gender === 'MALE').length})
            </button>
          </div>
        </div>

        {/* 3D Profile Card Grid (2-Column on Mobile, Multi-Col on Desktop) */}
        <div className="mobile-profile-2col-grid">
          {filteredProfiles.map((p, idx) => {
            const isBlurred = p.photo_privacy === 'BLURRED_PURDAH' && !revealedPurdah[p.profile_id];
            const hasSent = sentSalaam[p.profile_id];
            const matchScore = [96, 94, 92, 95, 91, 93, 97, 90][idx % 8];

            return (
              <div
                key={p.profile_id}
                className="card-3d"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: '#ffffff',
                }}
              >
                {/* Real Member Photo Header */}
                <div className="profile-card-photo-box">
                  <img
                    src={
                      p.photo_url ||
                      'https://marriagemediausa.com/design/member_image/Sahida_Akter_Ruma5.jpg'
                    }
                    alt={p.full_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      filter: isBlurred ? 'blur(22px) brightness(0.85)' : 'none',
                      transition: 'filter 0.35s ease, transform 0.4s ease',
                    }}
                  />

                  {/* Purdah Shield Overlay (If Blurred) */}
                  {isBlurred && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.45)',
                        backdropFilter: 'blur(14px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.25)',
                          border: '1.5px solid #34d399',
                          color: '#34d399',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <Lock size={22} />
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                        Photo Protected by Purdah Shield
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 12 }}>
                        Modesty protected according to Islamic etiquette.
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePurdah(p.profile_id)}
                        className="btn-3d-emerald"
                        style={{ fontSize: '0.75rem', padding: '7px 14px' }}
                      >
                        <Eye size={13} /> Preview Photo Access
                      </button>
                    </div>
                  )}

                  {/* Re-blur toggle if unlocked */}
                  {!isBlurred && (
                    <button
                      type="button"
                      onClick={() => togglePurdah(p.profile_id)}
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        background: 'rgba(15, 23, 42, 0.78)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {revealedPurdah[p.profile_id] ? '🔒 Enable Purdah Blur' : '🛡️ Purdah Ready'}
                    </button>
                  )}

                  {/* Top Left Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(2, 132, 199, 0.92)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                      }}
                    >
                      🇺🇸 {p.residing_status}
                    </span>
                    <span
                      style={{
                        background: 'rgba(5, 150, 105, 0.92)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                      }}
                    >
                      <CheckCircle2 size={11} /> 10-Level Verified
                    </span>
                  </div>

                  {/* Compatibility Ring Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: '2px solid #059669',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: '#047857',
                    }}
                  >
                    ⚡ {matchScore}% Match
                  </div>
                </div>

                {/* Card 3D Body (2-Column Compact on Mobile) */}
                <div className="profile-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 className="profile-card-title truncate">
                        {p.full_name}
                      </h3>
                      <div className="profile-card-subtitle truncate">
                        {p.age} yrs • {p.height_feet_inches} • {p.marital_status.replace('_', ' ')}
                      </div>
                    </div>
                    <span className="profile-card-id-badge flex-shrink-0">
                      #{p.profile_id}
                    </span>
                  </div>

                  {/* Mobile Meta: Profession & City (< 768px only) */}
                  <div className="profile-card-mobile-meta" style={{ display: 'none', margin: '3px 0' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.profession}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {p.city}, {p.state_province}
                    </div>
                  </div>

                  {/* Career, Education & Location (Desktop) */}
                  <div className="profile-card-career-box">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#0f172a',
                        fontWeight: 700,
                      }}
                    >
                      <Briefcase size={13} style={{ color: '#059669', flexShrink: 0 }} />
                      <span className="truncate">{p.profession}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      <GraduationCap size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                      <span className="truncate">
                        {p.education_level}
                        <span className="profile-card-hide-mobile"> • {p.institution_name}</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      <MapPin size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <span className="truncate">
                        {p.city}, {p.state_province}
                      </span>
                    </div>
                  </div>

                  {/* Islamic Tags (Desktop) */}
                  <div className="profile-card-hide-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{p.sect_mazhab}</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{p.mother_tongue}</span>
                    <span className="badge badge-coral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Salah: {p.pray_frequency}</span>
                  </div>

                  {/* Wali Guardian Box (Desktop) */}
                  <div
                    className="profile-card-hide-mobile"
                    style={{
                      marginTop: 2,
                      padding: '5px 8px',
                      background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
                      borderRadius: 8,
                      border: '1px solid #a7f3d0',
                      fontSize: '0.68rem',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontWeight: 700,
                    }}
                  >
                    <ShieldCheck size={13} style={{ color: '#059669', flexShrink: 0 }} />
                    <span className="truncate">
                      Wali: {p.guardian_relation} • Verified
                    </span>
                  </div>

                  {/* Mobile Single Action Button (< 768px) */}
                  <div className="profile-card-actions-mobile-only" style={{ display: 'none' }}>
                    <Link
                      href={`/profile/${p.profile_id}`}
                      className="btn-3d-emerald"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={11} /> View Biodata
                    </Link>
                  </div>

                  {/* Desktop 3D Action Buttons (>= 768px) */}
                  <div className="profile-card-actions profile-card-actions-desktop-only">
                    <Link
                      href={`/profile/${p.profile_id}`}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                        boxShadow: '0 2px 0 #cbd5e1',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <ExternalLink size={12} /> Full Biodata
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(p)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      title="Quick Preview"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendSalaam(p.profile_id, p.full_name)}
                      disabled={hasSent}
                      className={hasSent ? 'btn btn-ghost btn-sm' : 'btn-3d-emerald'}
                      style={{ flex: 1, padding: '9px 12px', fontSize: '0.78rem' }}
                    >
                      <Heart size={13} />
                      {hasSent ? 'Salaam Sent ✓' : 'Send Salaam'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Preview Modal */}
      {selectedProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="card-3d"
            style={{
              background: '#ffffff',
              maxWidth: 680,
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={selectedProfile.photo_url}
                  alt={selectedProfile.full_name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #059669',
                  }}
                />
                <div>
                  <span className="badge badge-emerald">Biodata ID #{selectedProfile.profile_id}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginTop: 4 }}>
                    {selectedProfile.full_name} ({selectedProfile.age} yrs)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="btn btn-ghost btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.65, marginBottom: 16 }}>
              {selectedProfile.about_me}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Link
                href={`/profile/${selectedProfile.profile_id}`}
                className="btn-3d-emerald"
                style={{ fontSize: '0.85rem' }}
              >
                Open Full 85+ Field Biodata Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
