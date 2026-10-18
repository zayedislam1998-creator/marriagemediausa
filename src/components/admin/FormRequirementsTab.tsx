'use client';

import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  HelpCircle,
  UserCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { ProfileRequirementRecord } from '@/db/queries';
import { updateProfileRequirementAction } from '@/lib/admin/requirementActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface FormRequirementsTabProps {
  initialRequirements: ProfileRequirementRecord[];
}

export function FormRequirementsTab({ initialRequirements }: FormRequirementsTabProps) {
  const [requirements, setRequirements] = useState<ProfileRequirementRecord[]>(initialRequirements);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Cross-Tab Reactivity
  useCrossTabSync((msg) => {
    if (msg.type === 'REQUIREMENTS_UPDATED') {
      setStatusMsg({ text: '✓ Form requirements synchronized from another session', isError: false });
    }
  }, ['REQUIREMENTS_UPDATED']);

  // Calculate total profile completion weight
  const totalWeight = requirements
    .filter((r) => r.isActive)
    .reduce((acc, curr) => acc + (curr.completionWeightPercent || 0), 0);

  const handleToggleRegistration = (id: string, currentVal: boolean) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRequiredForRegistration: !currentVal } : r))
    );
  };

  const handleToggleProfile = (id: string, currentVal: boolean) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRequiredForProfile: !currentVal } : r))
    );
  };

  const handleWeightChange = (id: string, weightStr: string) => {
    const val = parseInt(weightStr) || 0;
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completionWeightPercent: val } : r))
    );
  };

  const handleGenderChange = (id: string, gender: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, genderApplicable: gender } : r))
    );
  };

  const handleSaveRow = async (rule: ProfileRequirementRecord) => {
    setSavingId(rule.id);
    setStatusMsg(null);

    const res = await updateProfileRequirementAction(rule.id, {
      isRequiredForRegistration: rule.isRequiredForRegistration,
      isRequiredForProfile: rule.isRequiredForProfile,
      completionWeightPercent: rule.completionWeightPercent,
      genderApplicable: rule.genderApplicable,
      isActive: rule.isActive,
    });

    setSavingId(null);

    if (res.success) {
      setStatusMsg({ text: `✓ Rule for "${rule.fieldLabel}" saved successfully!`, isError: false });
      broadcastSyncEvent('REQUIREMENTS_UPDATED');
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ text: res.error || 'Failed to save rule', isError: true });
    }
  };

  const handleSaveAll = async () => {
    setStatusMsg({ text: 'Saving all requirements...', isError: false });
    for (const rule of requirements) {
      await updateProfileRequirementAction(rule.id, {
        isRequiredForRegistration: rule.isRequiredForRegistration,
        isRequiredForProfile: rule.isRequiredForProfile,
        completionWeightPercent: rule.completionWeightPercent,
        genderApplicable: rule.genderApplicable,
        isActive: rule.isActive,
      });
    }
    broadcastSyncEvent('REQUIREMENTS_UPDATED');
    setStatusMsg({ text: '✓ All registration and profile requirements saved successfully!', isError: false });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab Header Banner */}
      <div
        className="card-3d"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Registration & Profile Requirements Studio
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure mandatory fields for sign-up, biodata profile depth, completion weight %, and gender rules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Total Weight Meter */}
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              backgroundColor: totalWeight === 100 ? '#ECFDF5' : '#FEF3C7',
              border: `1.5px solid ${totalWeight === 100 ? '#10B981' : '#F59E0B'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: totalWeight === 100 ? '#047857' : '#B45309' }}>
              Total Weight: {totalWeight}%
            </span>
            {totalWeight === 100 ? (
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800 }}>✓ Balanced</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 800 }}>
                ({totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over`})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="btn-3d"
            style={{ fontSize: '0.85rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={16} /> Save All Rules
          </button>
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

      {/* Rules Table Card */}
      <div className="card-3d" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>
              <th style={{ padding: '12px 14px' }}>FIELD / REQUIREMENT</th>
              <th style={{ padding: '12px 14px' }}>CATEGORY</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>REGISTRATION REQUIRED?</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>PROFILE REQUIRED?</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>COMPLETION WEIGHT</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>GENDER APPLICABLE</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((rule) => {
              const isSaving = savingId === rule.id;
              return (
                <tr
                  key={rule.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {/* Field Label */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{rule.fieldLabel}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>key: {rule.fieldKey}</div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      {rule.category}
                    </span>
                  </td>

                  {/* Registration Required Toggle */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleRegistration(rule.id, rule.isRequiredForRegistration)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: rule.isRequiredForRegistration ? '#ECFDF5' : '#F1F5F9',
                        color: rule.isRequiredForRegistration ? '#047857' : '#64748B',
                      }}
                    >
                      {rule.isRequiredForRegistration ? '✓ Mandatory' : 'Optional'}
                    </button>
                  </td>

                  {/* Profile Required Toggle */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleProfile(rule.id, rule.isRequiredForProfile)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: rule.isRequiredForProfile ? '#ECFDF5' : '#F1F5F9',
                        color: rule.isRequiredForProfile ? '#047857' : '#64748B',
                      }}
                    >
                      {rule.isRequiredForProfile ? '✓ Required' : 'Optional'}
                    </button>
                  </td>

                  {/* Weight Input */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={rule.completionWeightPercent}
                        onChange={(e) => handleWeightChange(rule.id, e.target.value)}
                        style={{
                          width: '54px',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>%</span>
                    </div>
                  </td>

                  {/* Gender Selector */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <select
                      value={rule.genderApplicable}
                      onChange={(e) => handleGenderChange(rule.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#FFF',
                      }}
                    >
                      <option value="ALL">All Genders</option>
                      <option value="FEMALE">Female Only</option>
                      <option value="MALE">Male Only</option>
                    </select>
                  </td>

                  {/* Row Save Action */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveRow(rule)}
                      disabled={isSaving}
                      className="btn-3d-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      {isSaving ? <RefreshCw className="animate-spin" size={13} /> : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
