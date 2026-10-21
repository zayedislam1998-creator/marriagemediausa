'use client';

import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle, RefreshCw, Shield, Sparkles, Copy, Check, Link, Mail, Key } from 'lucide-react';
import { adminProvisionMemberAction } from '@/lib/admin/memberProvisionAction';
import { broadcastSyncEvent } from '@/lib/sync/broadcastSync';

interface ProvisionMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberProvisioned: (member: any) => void;
  packages: Array<{ id: number; name: string; priceUsd: number; contactCredits: number; isActive: boolean }>;
}

export function ProvisionMemberModal({ isOpen, onClose, onMemberProvisioned, packages }: ProvisionMemberModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invitation Mode
  const [sendInviteLink, setSendInviteLink] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+1 ');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('OTHER');
  const [packageId, setPackageId] = useState('');
  const [profession, setProfession] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [countryLivingIn, setCountryLivingIn] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [city, setCity] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('+1 ');
    setGender('MALE');
    setDateOfBirth('');
    setMaritalStatus('OTHER');
    setPackageId('');
    setProfession('');
    setEducationLevel('');
    setCountryLivingIn('');
    setStateProvince('');
    setCity('');
    setGuardianName('');
    setGuardianRelation('');
    setGuardianPhone('');
    setErrorMsg(null);
    setCreatedResult(null);
    setCopiedLink(false);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleCopyInvite = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('sendInviteLink', sendInviteLink ? 'true' : 'false');
    if (!sendInviteLink) {
      formData.append('password', password);
    }
    formData.append('phoneNumber', phoneNumber);
    formData.append('gender', gender);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('maritalStatus', maritalStatus);
    formData.append('packageId', packageId);
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
      broadcastSyncEvent('MEMBER_PROVISIONED', { email, packageId });
      setCreatedResult(res);
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
                Create Member Account
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                Creates the account, profile, and selected database package in one transaction. Admin grants are not payments.
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
        {createdResult ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <CheckCircle size={32} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
                  Member Successfully Provisioned!
                </h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#047857' }}>
                  Account for <strong>{createdResult.profile?.fullName || fullName}</strong> ({createdResult.user?.email || email}) has been registered in the database.
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#065F46' }}>
                  Profile ID: <strong>#{createdResult.profile?.profileId}</strong> &bull; Package: <strong>{createdResult.packageName || 'Granted Plan'}</strong>
                </p>
              </div>
            </div>

            {createdResult.inviteUrl ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link size={18} color="#0F766E" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                    Single-Use 30-Day Setup Invite Link
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  Send this link to the prospective candidate via WhatsApp, SMS, or Email. They will set their own private password securely.
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                >
                  <code style={{ fontSize: '0.8rem', color: '#0F172A', flex: 1, wordBreak: 'break-all' }}>
                    {typeof window !== 'undefined' ? `${window.location.origin}${createdResult.inviteUrl}` : createdResult.inviteUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(createdResult.inviteUrl)}
                    className="btn-3d"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                  color: '#334155',
                }}
              >
                Direct password was configured. The member can now log in at <code>/login</code> with the password you defined.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn-3d-secondary"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                Create Another Member
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="btn-3d"
                style={{ padding: '10px 24px', fontSize: '0.85rem' }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
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

            {/* Invitation vs Manual Password Selection */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Password & Onboarding Method
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: sendInviteLink ? '#F0FDF4' : '#FFFFFF',
                    border: `1.5px solid ${sendInviteLink ? '#10B981' : '#CBD5E1'}`,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="inviteMode"
                    checked={sendInviteLink}
                    onChange={() => setSendInviteLink(true)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: sendInviteLink ? '#065F46' : '#1E293B' }}>
                      30-Day Setup Invite Link (Recommended)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      Generates a secure 30-day token. The candidate sets their own private password.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: !sendInviteLink ? '#F8FAFC' : '#FFFFFF',
                    border: `1.5px solid ${!sendInviteLink ? '#0F172A' : '#CBD5E1'}`,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="inviteMode"
                    checked={!sendInviteLink}
                    onChange={() => setSendInviteLink(false)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: !sendInviteLink ? '#0F172A' : '#1E293B' }}>
                      Set Password Manually
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      Admin assigns the member password immediately.
                    </div>
                  </div>
                </label>
              </div>
            </div>

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

                {sendInviteLink ? (
                  <div>
                    <label style={labelStyle}>Password Assignment</label>
                    <div
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        fontSize: '0.78rem',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Sparkles size={14} color="#16A34A" />
                      <span>Setup link will be issued upon creation.</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Initial Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="input-field"
                      style={inputStyle}
                      required={!sendInviteLink}
                    />
                  </div>
                )}

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
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="input-field"
                    style={inputStyle}
                    required
                  >
                    <option value="">Choose a plan</option>
                    {packages.filter((pkg) => pkg.isActive).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — ${Number(pkg.priceUsd).toFixed(2)} / {pkg.contactCredits} credits
                      </option>
                    ))}
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
                    <option value="OTHER">Not provided / Other</option>
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
              <button type="button" onClick={handleModalClose} className="btn-3d-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-3d"
                style={{ padding: '10px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {submitting ? <RefreshCw className="animate-spin" size={16} /> : <UserPlus size={16} />}
                {sendInviteLink ? 'Create Member & Generate Invite' : 'Create Member with Password'}
              </button>
            </div>
          </form>
        )}
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
