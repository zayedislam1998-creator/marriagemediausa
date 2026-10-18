'use client';

import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Lock,
  User,
  FileText,
  KeyRound,
  Layout,
  Palette,
  Check,
  Move,
} from 'lucide-react';
import { FormBuilderConfigRecord, FormBuilderField } from '@/db/queries';
import { saveFormBuilderConfigAction } from '@/lib/admin/formBuilderActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface FormStudioTabProps {
  initialConfigs: FormBuilderConfigRecord[];
}

export function FormStudioTab({ initialConfigs }: FormStudioTabProps) {
  const [configs, setConfigs] = useState<FormBuilderConfigRecord[]>(initialConfigs);
  const [selectedFormId, setSelectedFormId] = useState<string>('login');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Cross-tab sync
  useCrossTabSync((msg) => {
    if (msg.type === 'FORM_LAYOUT_UPDATED') {
      setStatusMsg({ text: '✓ Form studio synchronized across active tabs', isError: false });
      setTimeout(() => setStatusMsg(null), 3500);
    }
  }, ['FORM_LAYOUT_UPDATED']);

  const activeConfig = configs.find((c) => c.formId === selectedFormId) || configs[0] || {
    formId: 'login',
    title: 'Login Form',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Sign In',
    fieldsJson: [],
    updatedAt: new Date(),
  };

  const fields = activeConfig.fieldsJson || [];

  // Update active form field property
  const handleUpdateField = (fieldId: string, updates: Partial<FormBuilderField>) => {
    setConfigs((prev) =>
      prev.map((c) => {
        if (c.formId !== selectedFormId) return c;
        return {
          ...c,
          fieldsJson: c.fieldsJson.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
        };
      })
    );
  };

  // Reorder fields (Move Up)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    const temp = newFields[index - 1];
    newFields[index - 1] = newFields[index];
    newFields[index] = temp;
    newFields.forEach((f, i) => (f.order = i + 1));

    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, fieldsJson: newFields } : c))
    );
  };

  // Reorder fields (Move Down)
  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    const temp = newFields[index + 1];
    newFields[index + 1] = newFields[index];
    newFields[index] = temp;
    newFields.forEach((f, i) => (f.order = i + 1));

    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, fieldsJson: newFields } : c))
    );
  };

  // Delete field from form
  const handleDeleteField = (fieldId: string) => {
    const newFields = fields.filter((f) => f.id !== fieldId);
    newFields.forEach((f, i) => (f.order = i + 1));
    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, fieldsJson: newFields } : c))
    );
  };

  // Add field to form
  const handleAddField = (fieldKey: string, label: string, type: any = 'text') => {
    const newField: FormBuilderField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fieldKey,
      label,
      placeholder: `Enter ${label.toLowerCase()}...`,
      type,
      required: true,
      width: 'full',
      order: fields.length + 1,
    };

    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, fieldsJson: [...c.fieldsJson, newField] } : c))
    );
  };

  // Update theme / styling
  const handleUpdateConfigMeta = (updates: Partial<FormBuilderConfigRecord>) => {
    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, ...updates } : c))
    );
  };

  // Save form layout
  const handleSaveForm = async () => {
    setSaving(true);
    setStatusMsg(null);

    const res = await saveFormBuilderConfigAction(selectedFormId, {
      title: activeConfig.title,
      theme: activeConfig.theme,
      borderRadius: activeConfig.borderRadius,
      buttonText: activeConfig.buttonText,
      fieldsJson: activeConfig.fieldsJson,
    });

    setSaving(false);

    if (res.success) {
      setStatusMsg({ text: `✓ ${activeConfig.title} layout saved and published!`, isError: false });
      broadcastSyncEvent('FORM_LAYOUT_UPDATED', { formId: selectedFormId });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ text: res.error || 'Failed to save form layout', isError: true });
    }
  };

  // Theme styling helpers
  const themeAccentColor = {
    emerald: 'var(--emerald-600, #059669)',
    gold: 'var(--gold-600, #D97706)',
    minimal: '#334155',
    dark: '#0F172A',
  }[activeConfig.theme] || '#059669';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Header Banner */}
      <div
        className="card-3d"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🎛️</span>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Interactive Form Studio & Theme Builder
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Configure fields, drag & drop order, customize themes, and preview forms for Login, Registration, Profile, and CV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveForm}
          disabled={saving}
          className="btn-3d"
          style={{ fontSize: '0.85rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          Save & Publish Form Layout
        </button>
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

      {/* 2. Compact 4 Form Switcher Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {[
          { id: 'login', title: 'Login Form', icon: KeyRound, desc: 'Member & Admin sign-in portal' },
          { id: 'register', title: 'Registration Form', icon: User, desc: 'Public sign-up & credentials' },
          { id: 'profile', title: 'Profile Biodata Form', icon: Layout, desc: '85+ field matrimonial biodata' },
          { id: 'cv', title: 'Matrimonial CV Form', icon: FileText, desc: 'Sunnah matrimonial resume document' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedFormId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedFormId(item.id)}
              className="card-3d"
              style={{
                padding: '16px 18px',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)' : '#FFFFFF',
                boxShadow: isSelected ? '0 10px 20px -5px rgba(5, 150, 105, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: isSelected ? 'rgba(5, 150, 105, 0.15)' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--emerald-600)' : '#64748B',
                  }}
                >
                  <Icon size={16} />
                </div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.title}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Theme & Form Settings Bar */}
      <div
        className="card-3d"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>
              FORM TITLE
            </label>
            <input
              type="text"
              value={activeConfig.title}
              onChange={(e) => handleUpdateConfigMeta({ title: e.target.value })}
              className="input-field"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '220px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>
              SUBMIT BUTTON TEXT
            </label>
            <input
              type="text"
              value={activeConfig.buttonText}
              onChange={(e) => handleUpdateConfigMeta({ buttonText: e.target.value })}
              className="input-field"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '220px' }}
            />
          </div>
        </div>

        {/* Theme Palette Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>THEME:</span>
          {[
            { id: 'emerald', label: 'Emerald', color: '#059669' },
            { id: 'gold', label: 'Gold Luxury', color: '#D97706' },
            { id: 'minimal', label: 'Slate Minimal', color: '#334155' },
            { id: 'dark', label: 'Midnight', color: '#0F172A' },
          ].map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => handleUpdateConfigMeta({ theme: th.id })}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: activeConfig.theme === th.id ? `2px solid ${th.color}` : '1px solid var(--border-subtle)',
                backgroundColor: activeConfig.theme === th.id ? '#F8FAFC' : '#FFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: th.color }} />
              {th.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Two-Column Studio Workspace: Left Editor vs Right Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '22px' }}>
        {/* Left Column: Draggable Fields Canvas */}
        <div className="card-3d" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Form Structure ({fields.length} Fields)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reorder or add fields to customize form
            </span>
          </div>

          {/* Fields Reorder List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '600px', overflowY: 'auto' }}>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Reorder Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: idx === 0 ? 'default' : 'pointer',
                      opacity: idx === 0 ? 0.3 : 1,
                      color: 'var(--text-muted)',
                    }}
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === fields.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: idx === fields.length - 1 ? 'default' : 'pointer',
                      opacity: idx === fields.length - 1 ? 0.3 : 1,
                      color: 'var(--text-muted)',
                    }}
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                      style={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        padding: 0,
                        outline: 'none',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                      style={{
                        fontSize: '0.75rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        padding: 0,
                        outline: 'none',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>

                {/* Width & Required Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateField(field.id, { width: field.width === 'half' ? 'full' : 'half' })}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: field.width === 'half' ? '#FEF3C7' : '#F1F5F9',
                      color: field.width === 'half' ? '#B45309' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="Toggle 1-Column vs 2-Column Width"
                  >
                    {field.width === 'half' ? '50% Width' : 'Full Width'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateField(field.id, { required: !field.required })}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: field.required ? '#ECFDF5' : '#F1F5F9',
                      color: field.required ? '#047857' : '#64748B',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {field.required ? 'Mandatory' : 'Optional'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteField(field.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    title="Remove Field"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Field Palette */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              QUICK-ADD FIELDS FROM PALETTE:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleAddField('phone_number', 'Phone Number', 'tel')}
                className="btn-3d-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                + Phone
              </button>
              <button
                type="button"
                onClick={() => handleAddField('date_of_birth', 'Date of Birth', 'date')}
                className="btn-3d-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                + DOB
              </button>
              <button
                type="button"
                onClick={() => handleAddField('guardian_wali', 'Wali / Guardian Name', 'text')}
                className="btn-3d-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                + Wali Guardian
              </button>
              <button
                type="button"
                onClick={() => handleAddField('profession', 'Profession & Career', 'text')}
                className="btn-3d-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                + Profession
              </button>
              <button
                type="button"
                onClick={() => handleAddField('custom_note', 'Matrimonial Notes', 'textarea')}
                className="btn-3d-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                + Custom Textarea
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Form Preview */}
        <div className="card-3d" style={{ padding: '24px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} color={themeAccentColor} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Live Interactive Form Preview</h3>
            </div>
            <span className="badge-3d" style={{ fontSize: '0.7rem' }}>
              WYSIWYG Mode
            </span>
          </div>

          {/* Form Container with Selected Theme */}
          <div
            style={{
              padding: '24px',
              borderRadius: activeConfig.borderRadius || '12px',
              border: `2px solid ${themeAccentColor}`,
              backgroundColor: activeConfig.theme === 'dark' ? '#0F172A' : '#FAFAFA',
              color: activeConfig.theme === 'dark' ? '#F8FAFC' : '#0F172A',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
              flex: 1,
            }}
          >
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', color: themeAccentColor }}>
              {activeConfig.title}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {fields.map((f) => {
                const isHalf = f.width === 'half';
                return (
                  <div
                    key={f.id}
                    style={{
                      gridColumn: isHalf ? 'span 1' : 'span 2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: activeConfig.theme === 'dark' ? '#CBD5E1' : '#334155' }}>
                      {f.label} {f.required && <span style={{ color: '#EF4444' }}>*</span>}
                    </label>

                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={f.placeholder}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #CBD5E1',
                          fontSize: '0.825rem',
                          backgroundColor: activeConfig.theme === 'dark' ? '#1E293B' : '#FFF',
                          color: activeConfig.theme === 'dark' ? '#FFF' : '#000',
                        }}
                      />
                    ) : f.type === 'static_header' ? (
                      <div style={{ textAlign: 'center', padding: '8px', color: themeAccentColor, fontFamily: "'Amiri', serif", fontSize: '1.15rem' }}>
                        {f.placeholder || f.label}
                      </div>
                    ) : f.type === 'rich_block' ? (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          backgroundColor: activeConfig.theme === 'dark' ? '#1E293B' : '#F1F5F9',
                          border: '1px dashed #CBD5E1',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        📄 {f.label} Content Block
                      </div>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        placeholder={f.placeholder}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #CBD5E1',
                          fontSize: '0.825rem',
                          backgroundColor: activeConfig.theme === 'dark' ? '#1E293B' : '#FFF',
                          color: activeConfig.theme === 'dark' ? '#FFF' : '#000',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                marginTop: 20,
                padding: '12px',
                borderRadius: 8,
                backgroundColor: themeAccentColor,
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {activeConfig.buttonText || 'Submit Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
