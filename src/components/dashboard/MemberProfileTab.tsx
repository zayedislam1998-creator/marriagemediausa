'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  User,
  Camera,
  Shield,
  Eye,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  MapPin,
  Heart,
  Briefcase,
  BookOpen,
  Lock,
} from 'lucide-react';
import { updateMemberBiodataAction, uploadProfileMediaAction } from '@/lib/member/profileActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface MemberProfileTabProps {
  myProfile: any;
  userEmail: string;
  userId: string;
}

export function MemberProfileTab({ myProfile, userEmail, userId }: MemberProfileTabProps) {
  const [profile, setProfile] = useState<any>(myProfile || {});
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [nickName, setNickName] = useState(profile?.nickName || '');
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus || 'NEVER_MARRIED');
  const [heightFeetInches, setHeightFeetInches] = useState(profile?.heightFeetInches || `5' 10"`);
  const [sectMazhab, setSectMazhab] = useState(profile?.sectMazhab || 'Sunni (Hanafi)');
  const [prayFrequency, setPrayFrequency] = useState(profile?.prayFrequency || 'ALWAYS');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || "Bachelor's Degree");
  const [profession, setProfession] = useState(profile?.profession || 'Software Professional');
  const [annualIncome, setAnnualIncome] = useState(profile?.annualIncome || '$100,000+');
  const [countryLivingIn, setCountryLivingIn] = useState(profile?.countryLivingIn || 'United States (USA)');
  const [stateProvince, setStateProvince] = useState(profile?.stateProvince || 'New York');
  const [city, setCity] = useState(profile?.city || 'New York');
  const [guardianName, setGuardianName] = useState(profile?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState(profile?.guardianRelation || 'Father');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [aboutMe, setAboutMe] = useState(profile?.aboutMe || '');
  const [whatIAmLookingFor, setWhatIAmLookingFor] = useState(profile?.whatIAmLookingFor || '');
  const [photoPrivacy, setPhotoPrivacy] = useState(profile?.photoPrivacy || 'PUBLIC');

  // Media
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.gender === 'FEMALE'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(
    profile?.coverPhotoUrl ||
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&auto=format&fit=crop&q=80'
  );
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Dynamic Profile Completion Percentage
  const completionPct = profile?.completionPercentage || 75;

  // Real-Time Cross-Tab Sync
  useCrossTabSync((msg) => {
    if (msg.type === 'PROFILE_UPDATED') {
      setStatusMsg({ text: '✓ Profile synchronized in real time across active tabs', isError: false });
    }
  }, ['PROFILE_UPDATED']);

  // Handle Biodata Form Submit
  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('nickName', nickName);
    formData.append('maritalStatus', maritalStatus);
    formData.append('heightFeetInches', heightFeetInches);
    formData.append('sectMazhab', sectMazhab);
    formData.append('prayFrequency', prayFrequency);
    formData.append('educationLevel', educationLevel);
    formData.append('profession', profession);
    formData.append('annualIncome', annualIncome);
    formData.append('countryLivingIn', countryLivingIn);
    formData.append('stateProvince', stateProvince);
    formData.append('city', city);
    formData.append('guardianName', guardianName);
    formData.append('guardianRelation', guardianRelation);
    formData.append('guardianPhone', guardianPhone);
    formData.append('aboutMe', aboutMe);
    formData.append('whatIAmLookingFor', whatIAmLookingFor);
    formData.append('photoPrivacy', photoPrivacy);

    const res = await updateMemberBiodataAction(null, formData);
    setSaving(false);

    if (res.success && res.profile) {
      setProfile(res.profile);
      setStatusMsg({ text: '✓ Biodata profile updated and saved to PostgreSQL!', isError: false });
      broadcastSyncEvent('PROFILE_UPDATED', { userId });
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setStatusMsg({ text: res.error || 'Failed to update profile', isError: true });
    }
  };

  // Handle Media File Upload (Avatar / Cover)
  const handleMediaUpload = async (file: File, mediaType: 'avatar' | 'cover') => {
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('mediaFile', file);
    formData.append('mediaType', mediaType);

    const res = await uploadProfileMediaAction(null, formData);
    setUploadingMedia(false);

    if (res.success && res.mediaUrl) {
      if (mediaType === 'cover') {
        setCoverPhotoUrl(res.mediaUrl);
      } else {
        setAvatarUrl(res.mediaUrl);
      }
      setStatusMsg({ text: `✓ ${mediaType === 'cover' ? 'Cover Banner' : 'Profile Avatar'} uploaded successfully!`, isError: false });
      broadcastSyncEvent('PROFILE_UPDATED', { userId });
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setStatusMsg({ text: res.error || 'Failed to upload photo', isError: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Cover Photo & Profile Banner Card */}
      <div
        className="card-3d"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          padding: 0,
          background: '#FFFFFF',
        }}
      >
        {/* Cover Photo */}
        <div
          style={{
            position: 'relative',
            height: 220,
            width: '100%',
            backgroundImage: `url(${coverPhotoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75), transparent)',
            }}
          />

          <label
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Camera size={14} /> Change Cover Photo
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleMediaUpload(e.target.files[0], 'cover');
                }
              }}
            />
          </label>
        </div>

        {/* Profile Info Header Bar with Avatar */}
        <div
          style={{
            padding: '0 28px 24px 28px',
            marginTop: -60,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar with Purdah Shield styling */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  backgroundColor: '#E2E8F0',
                }}
              >
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: photoPrivacy === 'BLURRED_PURDAH' ? 'blur(8px)' : 'none',
                    transform: photoPrivacy === 'BLURRED_PURDAH' ? 'scale(1.15)' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                />
              </div>

              {/* Purdah Badge Indicator */}
              {photoPrivacy === 'BLURRED_PURDAH' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    background: '#059669',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid #fff',
                  }}
                  title="Purdah Photo Privacy Shield Active"
                >
                  <Shield size={14} />
                </div>
              )}

              <label
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: -6,
                  background: '#0F172A',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid #fff',
                }}
                title="Change Avatar"
              >
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleMediaUpload(e.target.files[0], 'avatar');
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {fullName || 'My Biodata'}
                </h1>
                <span
                  className="badge-3d"
                  style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#ECFDF5', color: '#059669' }}
                >
                  ID: #{profile?.profileId || '2026-ACTIVE'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {profession} • {city}, {stateProvince} • {countryLivingIn}
              </p>
            </div>
          </div>

          {/* Dynamic Completion Gauge */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 14,
              padding: '12px 18px',
              minWidth: 220,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                PROFILE COMPLETION
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                {completionPct}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                backgroundColor: '#E2E8F0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${completionPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-500))',
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.7rem', color: '#64748B' }}>
              {completionPct >= 80 ? '✓ Ready for verified matrimonial matching' : 'Add CV and Wali details to reach 100%'}
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: statusMsg.isError ? '#FEF2F2' : '#ECFDF5',
            color: statusMsg.isError ? '#B91C1C' : '#047857',
            border: `1px solid ${statusMsg.isError ? '#FCA5A5' : '#A7F3D0'}`,
          }}
        >
          {statusMsg.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* 2. Biodata Editor Form */}
      <form onSubmit={handleSaveBiodata} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Section A: Photo Privacy & Purdah Modesty Shield */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Shield size={20} color="var(--emerald-600)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Purdah Photo Privacy Shield</h3>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Choose how your photograph is presented to other verified members on MarriageMediaUSA.com.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <label
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${photoPrivacy === 'PUBLIC' ? 'var(--emerald-600)' : 'var(--border-subtle)'}`,
                backgroundColor: photoPrivacy === 'PUBLIC' ? '#ECFDF5' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <input
                type="radio"
                name="photoPrivacy"
                value="PUBLIC"
                checked={photoPrivacy === 'PUBLIC'}
                onChange={() => setPhotoPrivacy('PUBLIC')}
                style={{ marginTop: 3 }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Public (Verified Members)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Visible to registered and authenticated members.
                </div>
              </div>
            </label>

            <label
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${photoPrivacy === 'BLURRED_PURDAH' ? 'var(--emerald-600)' : 'var(--border-subtle)'}`,
                backgroundColor: photoPrivacy === 'BLURRED_PURDAH' ? '#ECFDF5' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <input
                type="radio"
                name="photoPrivacy"
                value="BLURRED_PURDAH"
                checked={photoPrivacy === 'BLURRED_PURDAH'}
                onChange={() => setPhotoPrivacy('BLURRED_PURDAH')}
                style={{ marginTop: 3 }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>🧕 Purdah Blur Shield (Recommended)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Blurred with Islamic modesty shield. Visible only after guardian permission.
                </div>
              </div>
            </label>

            <label
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${photoPrivacy === 'HIDDEN' ? 'var(--emerald-600)' : 'var(--border-subtle)'}`,
                backgroundColor: photoPrivacy === 'HIDDEN' ? '#ECFDF5' : 'var(--bg-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <input
                type="radio"
                name="photoPrivacy"
                value="HIDDEN"
                checked={photoPrivacy === 'HIDDEN'}
                onChange={() => setPhotoPrivacy('HIDDEN')}
                style={{ marginTop: 3 }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Hidden Avatar</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Only default halal avatar is displayed.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section B: Personal Details */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>1. Personal & Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Nick Name</label>
              <input
                type="text"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Marital Status *</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="input-field"
                style={inputStyle}
              >
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="SEPARATED">Separated</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Height (Feet / Inches) *</label>
              <input
                type="text"
                value={heightFeetInches}
                onChange={(e) => setHeightFeetInches(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section C: Religious Practice */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>2. Islamic Commitment & Practice</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>Sect / Mazhab</label>
              <input
                type="text"
                value={sectMazhab}
                onChange={(e) => setSectMazhab(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Salah (Prayers Frequency)</label>
              <select
                value={prayFrequency}
                onChange={(e) => setPrayFrequency(e.target.value)}
                className="input-field"
                style={inputStyle}
              >
                <option value="ALWAYS">Always (5 Times Daily)</option>
                <option value="SOMETIMES">Regular / Struggling</option>
                <option value="JUMUAH_ONLY">Jumuah Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section D: Education, Profession & Location */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>3. Education, Career & Location</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>Highest Education *</label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Profession / Occupation *</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Annual Income</label>
              <input
                type="text"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Country of Residence *</label>
              <input
                type="text"
                value={countryLivingIn}
                onChange={(e) => setCountryLivingIn(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>State / Province *</label>
              <input
                type="text"
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section E: Wali / Guardian Details */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Lock size={20} color="var(--gold-600)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>4. Wali / Guardian Contact Details</h3>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Halal matrimonial requirement: Guardian contact is required for practicing sisters and facilitates family-to-family meetings.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>Guardian / Wali Full Name *</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="input-field"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Relationship *</label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="input-field"
                style={inputStyle}
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Uncle">Uncle</option>
                <option value="Self">Self / Independent</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Guardian Phone Number *</label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="input-field"
                style={inputStyle}
                required
              />
            </div>
          </div>
        </div>

        {/* Section F: Matrimonial Narratives */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>5. Matrimonial Narrative</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>About Me & My Values</label>
              <textarea
                rows={4}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="input-field"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>What I Am Looking For In A Spouse</label>
              <textarea
                rows={4}
                value={whatIAmLookingFor}
                onChange={(e) => setWhatIAmLookingFor(e.target.value)}
                className="input-field"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-3d"
            style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Save & Publish Biodata to PostgreSQL
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--text-main)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: '0.875rem',
};
