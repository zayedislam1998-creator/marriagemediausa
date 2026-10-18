'use client';

import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { adminProvisionMemberAction } from '@/lib/admin/memberProvisionAction';
import { broadcastSyncEvent } from '@/lib/sync/broadcastSync';

interface ProvisionMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberProvisioned: (member: any) => void;
}

export function ProvisionMemberModal({ isOpen, onClose, onMemberProvisioned }: ProvisionMemberModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Salam2026!');
  const [phoneNumber, setPhoneNumber] = useState('+1 ');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('1998-05-15');
  const [maritalStatus, setMaritalStatus] = useState('NEVER_MARRIED');
  const [tier, setTier] = useState('GOLD');
  const [profession, setProfession] = useState('Software Engineer');
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [countryLivingIn, setCountryLivingIn] = useState('United States (USA)');
  const [stateProvince, setStateProvince] = useState('New York');
  const [city, setCity] = useState('New York');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phoneNumber', phoneNumber);
    formData.append('gender', gender);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('maritalStatus', maritalStatus);
    formData.append('tier', tier);
    formData.append('profession', profession);
    formData.append('educationLevel', educationLevel);
    formData.append('countryLivingIn', countryLivingIn);
    formData.append('stateProvince', stateProvince);
    formData.append('city', city);
    formData.append('guardianName', guardianName);
    formData.append('guardianRelation', guardianRelation);
    formData.append('guardianPhone', guardianPhone);

    const res = await adminProvisionMemberAction(null, formData);
    setSubmitting(false);

    if (res.success && res.user) {
      onMemberProvisioned(res);
      broadcastSyncEvent('MEMBER_PROVISIONED', { email, tier });
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to provision member');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                Provision New Verified Member
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                Directly register a member with tier allocation and credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '12px',
                borderRadius: 8,
                backgroundColor: '#FEF2F2',
                color: '#B91C1C',
                border: '1px solid #FCA5A5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Section 1: Auth & Basic Info */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 800 }}>
              1. Credentials & Identity
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Shahidul Islam"
                  className="input-field"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="input-field"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Initial Password *</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gender, DOB, Tier */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 800 }}>
              2. Gender, DOB & Membership Tier
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="input-field"
                  style={inputStyle}
                >
                  <option value="MALE">Brother (Groom)</option>
                  <option value="FEMALE">Sister (Bride)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Membership Tier *</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                >
                  <option value="FREE">Free Explorer ($0)</option>
                  <option value="SILVER">Silver Verified ($2,000)</option>
                  <option value="GOLD">Gold Shield ($3,000)</option>
                  <option value="PLATINUM">Platinum VIP ($4,000)</option>
                  <option value="ELITE">US Elite Concierge ($6,500)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Marital Status</label>
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
            </div>
          </div>

          {/* Section 3: Profession & Location */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 800 }}>
              3. Profession & Location
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>City, State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="input-field"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Country</label>
                <input
                  type="text"
                  value={countryLivingIn}
                  onChange={(e) => setCountryLivingIn(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Wali / Guardian Details */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 800 }}>
              4. Wali / Guardian Contact (Mandatory for Sisters)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Guardian Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Guardian Name"
                  className="input-field"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Relation</label>
                <input
                  type="text"
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  placeholder="Father / Brother"
                  className="input-field"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Guardian Phone</label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-3d-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-3d"
              style={{ padding: '10px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {submitting ? <RefreshCw className="animate-spin" size={16} /> : <UserPlus size={16} />}
              Provision & Register Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  fontSize: '0.85rem',
  border: '1px solid #CBD5E1',
};
