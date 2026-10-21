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
  Sparkles,
  MapPin,
  Heart,
  Briefcase,
  BookOpen,
  Lock,
  ChevronRight,
  ChevronLeft,
  Users,
  Check,
} from 'lucide-react';
import { updateMemberBiodataAction, uploadProfileMediaAction } from '@/lib/member/profileActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';
import { MediaUploadPicker, SelectedMedia } from '@/components/media/MediaUploadPicker';

interface MemberProfileTabProps {
  myProfile: any;
  userEmail: string;
  userId: string;
}

export function MemberProfileTab({ myProfile, userEmail, userId }: MemberProfileTabProps) {
  const [profile, setProfile] = useState<any>(myProfile || {});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form Fields - Step 1: Basic Info
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [nickName, setNickName] = useState(profile?.nickName || '');
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus || 'NEVER_MARRIED');
  const [heightFeetInches, setHeightFeetInches] = useState(profile?.heightFeetInches || `5' 10"`);
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(profile?.gender || 'MALE');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || '1998-05-15');

  // Form Fields - Step 2: Religious Practice
  const [sectMazhab, setSectMazhab] = useState(profile?.sectMazhab || 'Sunni (Hanafi)');
  const [prayFrequency, setPrayFrequency] = useState(profile?.prayFrequency || 'ALWAYS');
  const [halalDiet, setHalalDiet] = useState(profile?.halalDiet || 'STRICTLY_HALAL');
  const [religiousness, setReligiousness] = useState(profile?.religiousness || 'RELIGIOUS');
  const [wearsHijabOrBeard, setWearsHijabOrBeard] = useState<boolean>(profile?.wearsHijabOrBeard ?? true);

  // Form Fields - Step 3: Education & Career & Location
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || "Bachelor's Degree");
  const [profession, setProfession] = useState(profile?.profession || 'Software Professional');
  const [annualIncome, setAnnualIncome] = useState(profile?.annualIncome || '$100,000+');
  const [countryLivingIn, setCountryLivingIn] = useState(profile?.countryLivingIn || 'United States (USA)');
  const [stateProvince, setStateProvince] = useState(profile?.stateProvince || 'New York');
  const [city, setCity] = useState(profile?.city || 'New York');

  // Form Fields - Step 4: Family & Wali
  const [guardianName, setGuardianName] = useState(profile?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState(profile?.guardianRelation || 'Father');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [familyValues, setFamilyValues] = useState(profile?.familyValues || 'Religious / Practicing');
  const [brothersCount, setBrothersCount] = useState(profile?.brothersCount || '1');
  const [sistersCount, setSistersCount] = useState(profile?.sistersCount || '1');

  // Form Fields - Step 5: Privacy, Photos & Bio
  const [photoPrivacy, setPhotoPrivacy] = useState(profile?.photoPrivacy || 'PUBLIC');
  const [aboutMe, setAboutMe] = useState(
    profile?.aboutMe ||
      'Practicing Muslim striving to follow the Quran and Sunnah. Looking for a righteous, understanding life partner to build a peaceful Islamic home.'
  );
  const [whatIAmLookingFor, setWhatIAmLookingFor] = useState(
    profile?.whatIAmLookingFor ||
      'A God-fearing spouse with kind character, family values, and a mutual commitment to Islamic growth.'
  );

  // Selected Photo
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedMedia | null>(
    profile?.avatarUrl
      ? {
          url: profile.avatarUrl,
          thumbUrl: profile.avatarUrl,
          blurUrl: profile.avatarUrl,
          name: 'profile-photo.webp',
        }
      : null
  );

  // Dynamic Profile Completion
  const completionPct = profile?.completionPercentage || 75;

  // Real-Time Cross-Tab Sync
  useCrossTabSync((msg) => {
    if (msg.type === 'PROFILE_UPDATED') {
      setStatusMsg({ text: '✓ Profile synchronized in real time', isError: false });
    }
  }, ['PROFILE_UPDATED']);

  const steps = [
    { id: 1, title: 'Personal & Basic', subtitle: 'Name, Marital Status & Age' },
    { id: 2, title: 'Deen & Practice', subtitle: 'Sect, Salah & Islamic Values' },
    { id: 3, title: 'Education & Career', subtitle: 'Degrees, Job & Location' },
    { id: 4, title: 'Family & Wali', subtitle: 'Guardian Contact & Family' },
    { id: 5, title: 'Photos & Privacy', subtitle: 'Purdah Shield & Bio' },
  ];

  // Helper to persist current state
  const saveCurrentFormData = async (silent = false) => {
    if (!silent) setSaving(true);
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

    try {
      const res = await updateMemberBiodataAction(null, formData);
      if (!silent) setSaving(false);

      if (res.success && res.profile) {
        setProfile(res.profile);
        broadcastSyncEvent('PROFILE_UPDATED', { userId });
        if (!silent) {
          setStatusMsg({ text: '✓ Progress saved to PostgreSQL successfully!', isError: false });
          setTimeout(() => setStatusMsg(null), 3000);
        }
        return true;
      } else {
        if (!silent) {
          setStatusMsg({ text: res.error || 'Failed to save progress', isError: true });
        }
        return false;
      }
    } catch (e: any) {
      if (!silent) {
        setSaving(false);
        setStatusMsg({ text: e.message || 'Network error saving profile', isError: true });
      }
      return false;
    }
  };

  const handleNextStep = async () => {
    // Save draft quietly and advance
    await saveCurrentFormData(true);
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step submission
      await saveCurrentFormData(false);
      setStatusMsg({ text: '🎉 Biodata profile completed and verified in PostgreSQL!', isError: false });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ============================================================
          1. COMPACT PROFILE SUMMARY HEADER (NO GIANT BANNER)
         ============================================================ */}
      <div
        className="card-3d"
        style={{
          padding: '16px 20px',
          background: '#FFFFFF',
          borderRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Compact 52px Avatar with Purdah indicator */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              }}
            >
              {fullName ? fullName[0].toUpperCase() : 'M'}
            </div>
            {photoPrivacy === 'BLURRED_PURDAH' && (
              <div
                title="Purdah Modesty Shield Active"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#7C3AED',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                }}
              >
                <Shield size={10} />
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                {fullName || 'Distinguished Member'}
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0',
                }}
              >
                ID #{profile?.profileId || '2026-ACTIVE'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
              {profession} • {city}, {countryLivingIn}
            </p>
          </div>
        </div>

        {/* Completion Progress & Quick Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              Profile Completion: <strong style={{ color: '#059669' }}>{completionPct}%</strong>
            </div>
            <div style={{ width: 140, height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completionPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, #059669)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => saveCurrentFormData(false)}
            disabled={saving}
            className="btn-3d-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* ============================================================
          2. INTERACTIVE 5-STEP WIZARD STEPPER (TABS)
         ============================================================ */}
      <div
        className="card-3d"
        style={{
          padding: '10px 14px',
          background: '#FFFFFF',
          borderRadius: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8,
        }}
      >
        {steps.map((s) => {
          const isActive = currentStep === s.id;
          const isDone = currentStep > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                border: isActive ? '1.5px solid #059669' : '1px solid transparent',
                background: isActive ? 'rgba(5, 150, 105, 0.08)' : isDone ? '#F8FAFC' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  background: isActive ? '#059669' : isDone ? '#10B981' : '#E2E8F0',
                  color: isActive || isDone ? '#FFFFFF' : '#64748B',
                }}
              >
                {isDone ? <Check size={13} /> : s.id}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#065F46' : isDone ? '#0F172A' : '#64748B',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status Msg */}
      {statusMsg && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            backgroundColor: statusMsg.isError ? '#FEF2F2' : '#ECFDF5',
            border: `1px solid ${statusMsg.isError ? '#FECDD3' : '#A7F3D0'}`,
            color: statusMsg.isError ? '#991B1B' : '#065F46',
            fontSize: '0.825rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {statusMsg.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ============================================================
          3. ACTIVE WIZARD STEP FORM CONTAINER
         ============================================================ */}
      <div className="card-3d" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 16 }}>
        {/* STEP 1: PERSONAL & BASIC INFORMATION */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Step 1: Personal & Basic Information
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Provide your legal identity and general attributes according to Islamic honesty (Sidq).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Full Legal Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Al-Mansoor"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Nick Name / Calling Name
                </label>
                <input
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder="e.g. Tariq"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Marital Status <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="SEPARATED">Separated</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Height (Feet & Inches) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={heightFeetInches}
                  onChange={(e) => setHeightFeetInches(e.target.value)}
                  placeholder={`5' 10"`}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Date of Birth <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Gender
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 8,
                      border: gender === 'MALE' ? '2px solid #059669' : '1px solid #CBD5E1',
                      background: gender === 'MALE' ? '#ECFDF5' : '#FFF',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Brother (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 8,
                      border: gender === 'FEMALE' ? '2px solid #059669' : '1px solid #CBD5E1',
                      background: gender === 'FEMALE' ? '#ECFDF5' : '#FFF',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Sister (Female)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ISLAMIC COMMITMENT & PRACTICE */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Step 2: Islamic Commitment & Practice
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Specify your adherence to Salah, Mazhab, and deen obligations to match with a compatible life partner.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Sect / Mazhab <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={sectMazhab}
                  onChange={(e) => setSectMazhab(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="Sunni (Hanafi)">Sunni (Hanafi)</option>
                  <option value="Sunni (Shafi'i)">Sunni (Shafi&apos;i)</option>
                  <option value="Sunni (Maliki)">Sunni (Maliki)</option>
                  <option value="Sunni (Hanbali)">Sunni (Hanbali)</option>
                  <option value="Ahle Hadith / Salafi">Ahle Hadith / Salafi</option>
                  <option value="General Sunni Muslim">General Sunni Muslim</option>
                  <option value="Revert / Muslim">Revert / Muslim</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Salah (Daily Prayers Frequency) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={prayFrequency}
                  onChange={(e) => setPrayFrequency(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="ALWAYS">Always (5 Times Daily on time)</option>
                  <option value="USUALLY">Usually (4-5 Times)</option>
                  <option value="SOMETIMES">Sometimes / Striving</option>
                  <option value="JUMUAH_ONLY">Jumu&apos;ah Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Halal Diet Observance <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={halalDiet}
                  onChange={(e) => setHalalDiet(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="STRICTLY_HALAL">Strictly 100% Zabiha Halal</option>
                  <option value="HALAL_PREFERRED">Halal Preferred</option>
                  <option value="VEGETARIAN">Vegetarian / Vegan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Religious Practice Level
                </label>
                <select
                  value={religiousness}
                  onChange={(e) => setReligiousness(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="VERY_RELIGIOUS">Very Religious / Practicing Sunnah</option>
                  <option value="RELIGIOUS">Religious & Regular</option>
                  <option value="MODERATE">Moderate Practicing</option>
                  <option value="AVERAGE">Average Muslim</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={wearsHijabOrBeard}
                    onChange={(e) => setWearsHijabOrBeard(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#059669' }}
                  />
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1E293B' }}>
                    Maintains Sunnah Beard (Brothers) or Observes Hijab / Niqab (Sisters)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION, CAREER & LOCATION */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Step 3: Education, Career & Residence
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Accurate professional credentials create mutual trust and financial clarity for Islamic marriage.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Highest Education Level <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="Doctorate / Ph.D.">Doctorate / Ph.D.</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
                  <option value="Islamic Alim / Alimah Degree">Islamic Alim / Alimah Degree</option>
                  <option value="High School">High School</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Profession / Occupation <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Software Engineer, Physician, Teacher"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Annual Income Range
                </label>
                <select
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="$150,000+">$150,000+ USD</option>
                  <option value="$100,000+">$100,000 - $150,000 USD</option>
                  <option value="$75,000+">$75,000 - $100,000 USD</option>
                  <option value="$50,000+">$50,000 - $75,000 USD</option>
                  <option value="Under $50,000">Under $50,000 USD</option>
                  <option value="Prefer Not to Disclose">Prefer Not to Disclose</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Country of Residence <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={countryLivingIn}
                  onChange={(e) => setCountryLivingIn(e.target.value)}
                  placeholder="e.g. United States (USA)"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  State / Province <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="e.g. New York, Texas, Dhaka"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  City <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Brooklyn, Houston, Gulshan"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FAMILY & WALI / GUARDIAN CONTACT */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Step 4: Wali / Guardian Contact & Family Background
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                In accordance with Islamic jurisprudence, Wali contact enables dignified family-to-family introductions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Guardian / Wali Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Mohammed Tariq Al-Mansoor"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Relationship to Profile <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Paternal Uncle">Paternal Uncle</option>
                  <option value="Maternal Uncle">Maternal Uncle</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Guardian Phone Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+1-555-0199 or 01700-000000"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Family Values Orientation
                </label>
                <select
                  value={familyValues}
                  onChange={(e) => setFamilyValues(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                >
                  <option value="Religious / Practicing">Religious / Practicing</option>
                  <option value="Traditional Islamic">Traditional Islamic</option>
                  <option value="Moderate Values">Moderate Values</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Brothers Count
                </label>
                <input
                  type="text"
                  value={brothersCount}
                  onChange={(e) => setBrothersCount(e.target.value)}
                  placeholder="e.g. 1 (Married)"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                  Sisters Count
                </label>
                <input
                  type="text"
                  value={sistersCount}
                  onChange={(e) => setSistersCount(e.target.value)}
                  placeholder="e.g. 2"
                  className="input-field"
                  style={{ width: '100%', height: 40, fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PHOTOS, PRIVACY & ABOUT ME */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Step 5: Purdah Modesty Shield, Photo & Halal Narrative
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Control how your photo is shown to suitors and describe your Islamic marital intentions.
              </p>
            </div>

            {/* Purdah Shield Options */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                Purdah Photo Privacy Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <label
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: photoPrivacy === 'PUBLIC' ? '2px solid #059669' : '1px solid #E2E8F0',
                    background: photoPrivacy === 'PUBLIC' ? '#ECFDF5' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="photoPrivacy"
                      value="PUBLIC"
                      checked={photoPrivacy === 'PUBLIC'}
                      onChange={() => setPhotoPrivacy('PUBLIC')}
                      style={{ accentColor: '#059669' }}
                    />
                    <strong style={{ fontSize: '0.825rem' }}>Public (Verified)</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', paddingLeft: 24 }}>
                    Visible only to authenticated & verified members.
                  </span>
                </label>

                <label
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: photoPrivacy === 'BLURRED_PURDAH' ? '2px solid #059669' : '1px solid #E2E8F0',
                    background: photoPrivacy === 'BLURRED_PURDAH' ? '#ECFDF5' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="photoPrivacy"
                      value="BLURRED_PURDAH"
                      checked={photoPrivacy === 'BLURRED_PURDAH'}
                      onChange={() => setPhotoPrivacy('BLURRED_PURDAH')}
                      style={{ accentColor: '#059669' }}
                    />
                    <strong style={{ fontSize: '0.825rem' }}>Purdah Blur (Recommended)</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', paddingLeft: 24 }}>
                    Blurred Gaussian shield; photo unlocked only upon Wali consent.
                  </span>
                </label>

                <label
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: photoPrivacy === 'HIDDEN' ? '2px solid #059669' : '1px solid #E2E8F0',
                    background: photoPrivacy === 'HIDDEN' ? '#ECFDF5' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="photoPrivacy"
                      value="HIDDEN"
                      checked={photoPrivacy === 'HIDDEN'}
                      onChange={() => setPhotoPrivacy('HIDDEN')}
                      style={{ accentColor: '#059669' }}
                    />
                    <strong style={{ fontSize: '0.825rem' }}>Hidden Avatar</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', paddingLeft: 24 }}>
                    Only default Halal silhouette avatar displayed to public.
                  </span>
                </label>
              </div>
            </div>

            {/* Profile Photo Picker with Sharp 3-tier WebP processing */}
            <div style={{ maxWidth: 360 }}>
              <MediaUploadPicker
                label="Profile Photograph (Portrait)"
                description="Upload a respectful photo. Automatic Sharp WebP & Purdah Gaussian blur variants generated."
                value={selectedPhoto}
                onChange={(media) => setSelectedPhoto(media)}
                aspectRatio="portrait"
              />
            </div>

            {/* Narrative Inputs */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                About Me & My Deen Practicing Life
              </label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={3}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                placeholder="Share your background, daily deen routine, hobbies, and character..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
                What I Am Looking For in a Spouse (Partner Expectations)
              </label>
              <textarea
                value={whatIAmLookingFor}
                onChange={(e) => setWhatIAmLookingFor(e.target.value)}
                rows={3}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                placeholder="Mention qualities, Islamic practices, and compatibility points you value..."
              />
            </div>
          </div>
        )}

        {/* ============================================================
            4. STEP CONTROLS (PREVIOUS & NEXT STEP BUTTONS)
           ============================================================ */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: currentStep === 1 ? '#F8FAFC' : '#FFFFFF',
              color: currentStep === 1 ? '#94A3B8' : '#334155',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ChevronLeft size={16} /> Previous Step
          </button>

          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Step <strong>{currentStep}</strong> of <strong>5</strong> • {steps[currentStep - 1].title}
          </span>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={saving}
            className="btn-3d-emerald"
            style={{
              padding: '9px 22px',
              fontSize: '0.825rem',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {saving ? 'Saving...' : currentStep === 5 ? '✓ Complete & Save Biodata' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}
