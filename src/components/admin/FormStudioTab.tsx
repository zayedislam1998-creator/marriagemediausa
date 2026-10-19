'use client';

import React, { useState, useEffect } from 'react';
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
  CreditCard,
  GripVertical,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { FormBuilderConfigRecord, FormBuilderField } from '@/db/queries';
import { saveFormBuilderConfigAction } from '@/lib/admin/formBuilderActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface FormStudioTabProps {
  initialConfigs: FormBuilderConfigRecord[];
}

const DEFAULT_TEMPLATES: Record<string, FormBuilderConfigRecord> = {
  login: {
    formId: 'login',
    title: 'Member & Admin Login Portal',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Sign In to Account',
    fieldsJson: [
      { id: 'f_log_1', fieldKey: 'identifier', label: 'Email or Mobile Number', placeholder: 'Enter registered email or phone...', type: 'text', required: true, width: 'full', order: 1 },
      { id: 'f_log_2', fieldKey: 'password', label: 'Password', placeholder: 'Enter your account password...', type: 'password', required: true, width: 'full', order: 2 },
    ],
    updatedAt: new Date(),
  },
  register: {
    formId: 'register',
    title: 'New Member Registration',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Create Verified Account',
    fieldsJson: [
      { id: 'f_reg_1', fieldKey: 'name', label: 'Candidate Full Name', placeholder: 'Official full name', type: 'text', required: true, width: 'half', order: 1 },
      { id: 'f_reg_2', fieldKey: 'gender', label: 'Gender', placeholder: 'Select gender (Male / Female)', type: 'select', required: true, width: 'half', order: 2 },
      { id: 'f_reg_3', fieldKey: 'email', label: 'Email Address', placeholder: 'name@example.com', type: 'email', required: true, width: 'full', order: 3 },
      { id: 'f_reg_4', fieldKey: 'phone', label: 'WhatsApp / Mobile Number', placeholder: '+1 or +880...', type: 'tel', required: true, width: 'full', order: 4 },
      { id: 'f_reg_5', fieldKey: 'password', label: 'Create Secure Password', placeholder: 'Minimum 8 characters...', type: 'password', required: true, width: 'full', order: 5 },
    ],
    updatedAt: new Date(),
  },
  profile: {
    formId: 'profile',
    title: 'Matrimonial Biodata Profile Form',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Save Biodata Profile',
    fieldsJson: [
      { id: 'f_prf_1', fieldKey: 'full_name', label: 'Full Legal Name', placeholder: 'Full Name', type: 'text', required: true, width: 'half', order: 1 },
      { id: 'f_prf_2', fieldKey: 'gender', label: 'Gender', placeholder: 'Gender', type: 'select', required: true, width: 'half', order: 2 },
      { id: 'f_prf_3', fieldKey: 'date_of_birth', label: 'Date of Birth', placeholder: 'YYYY-MM-DD', type: 'date', required: true, width: 'half', order: 3 },
      { id: 'f_prf_4', fieldKey: 'marital_status', label: 'Marital Status', placeholder: 'Marital Status', type: 'select', required: true, width: 'half', order: 4 },
      { id: 'f_prf_5', fieldKey: 'profession', label: 'Profession & Sector', placeholder: 'Profession', type: 'text', required: true, width: 'half', order: 5 },
      { id: 'f_prf_6', fieldKey: 'guardian_phone', label: 'Guardian / Wali Contact', placeholder: '+1 or +880...', type: 'tel', required: true, width: 'half', order: 6 },
    ],
    updatedAt: new Date(),
  },
  cv: {
    formId: 'cv',
    title: 'Sunnah Matrimonial CV Resume',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Generate Matrimonial CV',
    fieldsJson: [
      { id: 'f_cv_1', fieldKey: 'cv_header', label: 'Bismillah & Basmala', placeholder: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', type: 'static_header', required: false, width: 'full', order: 1 },
      { id: 'f_cv_2', fieldKey: 'cv_summary', label: 'Islamic Executive Summary', placeholder: 'Overview of Islamic values, life goals...', type: 'textarea', required: true, width: 'full', order: 2 },
      { id: 'f_cv_3', fieldKey: 'cv_education', label: 'Academic & Religious Qualifications', placeholder: 'Degrees, Quranic studies...', type: 'textarea', required: true, width: 'full', order: 3 },
    ],
    updatedAt: new Date(),
  },
  payment: {
    formId: 'payment',
    title: 'Payment Gateway Fields & Checkout',
    theme: 'emerald',
    borderRadius: '12px',
    buttonText: 'Proceed to Secure Payment',
    fieldsJson: [
      { id: 'f_pay_1', fieldKey: 'profile_token', label: 'Member Biodata Profile Token', placeholder: 'Auto-populated (e.g. #2026044925)', type: 'text', required: true, width: 'half', order: 1 },
      { id: 'f_pay_2', fieldKey: 'payer_name', label: 'Cardholder / Payer Full Name', placeholder: 'Name on card or account', type: 'text', required: true, width: 'half', order: 2 },
      { id: 'f_pay_3', fieldKey: 'payer_email', label: 'Billing Confirmation Email', placeholder: 'receipts@example.com', type: 'email', required: true, width: 'half', order: 3 },
      { id: 'f_pay_4', fieldKey: 'payer_phone', label: 'WhatsApp / Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, width: 'half', order: 4 },
      { id: 'f_pay_5', fieldKey: 'billing_address', label: 'Street Address', placeholder: '123 Muslim Way, Suite 4B', type: 'text', required: false, width: 'full', order: 5 },
      { id: 'f_pay_6', fieldKey: 'city', label: 'City', placeholder: 'City', type: 'text', required: true, width: 'half', order: 6 },
      { id: 'f_pay_7', fieldKey: 'state_province', label: 'State / Province / Division', placeholder: 'State or Division', type: 'text', required: true, width: 'half', order: 7 },
      { id: 'f_pay_8', fieldKey: 'postal_code', label: 'Postal Code / ZIP', placeholder: 'Zip code', type: 'text', required: true, width: 'half', order: 8 },
      { id: 'f_pay_9', fieldKey: 'country', label: 'Country', placeholder: 'Country of residence', type: 'text', required: true, width: 'half', order: 9 },
      { id: 'f_pay_10', fieldKey: 'wali_consent', label: 'Wali / Guardian Acknowledgment', placeholder: 'Wali confirmed package upgrade', type: 'checkbox', required: false, width: 'full', order: 10 },
    ],
    updatedAt: new Date(),
  },
};

export function FormStudioTab({ initialConfigs }: FormStudioTabProps) {
  // Merge initialConfigs with DEFAULT_TEMPLATES to ensure all 5 forms always exist
  const [configs, setConfigs] = useState<FormBuilderConfigRecord[]>(() => {
    const map = new Map<string, FormBuilderConfigRecord>();
    Object.keys(DEFAULT_TEMPLATES).forEach((k) => map.set(k, DEFAULT_TEMPLATES[k]));
    (initialConfigs || []).forEach((c) => {
      if (c && c.formId) map.set(c.formId, c);
    });
    return Array.from(map.values());
  });

  const [selectedFormId, setSelectedFormId] = useState<string>('login');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Cross-tab sync listener
  useCrossTabSync((msg) => {
    if (msg.type === 'FORM_LAYOUT_UPDATED') {
      setStatusMsg({ text: '✓ Form Studio synchronized across active browser windows', isError: false });
      setTimeout(() => setStatusMsg(null), 3500);
    }
  }, ['FORM_LAYOUT_UPDATED']);

  const activeConfig =
    configs.find((c) => c.formId === selectedFormId) ||
    DEFAULT_TEMPLATES[selectedFormId] ||
    DEFAULT_TEMPLATES.login;

  const fields = activeConfig.fieldsJson || [];

  // Drag and Drop End handler using official @hello-pangea/dnd
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const reordered = Array.from(fields);
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, removed);
    reordered.forEach((f, i) => (f.order = i + 1));

    setConfigs((prev) =>
      prev.map((c) => (c.formId === selectedFormId ? { ...c, fieldsJson: reordered } : c))
    );
  };

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

  // Accessible Reorder buttons (Move Up / Down)
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
  const handleAddField = (fieldKey: string, label: string, type: any = 'text', width: 'half' | 'full' = 'full') => {
    const newField: FormBuilderField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fieldKey,
      label,
      placeholder: `Enter ${label.toLowerCase()}...`,
      type,
      required: true,
      width,
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

  // Save form layout to PostgreSQL
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

  const themeAccentColor = {
    emerald: 'var(--emerald-600, #059669)',
    gold: 'var(--gold-600, #D97706)',
    minimal: '#334155',
    dark: '#0F172A',
  }[activeConfig.theme] || '#059669';

  const formTabs = [
    { id: 'login', title: 'Login Form', icon: KeyRound, desc: 'Member & Admin sign-in portal' },
    { id: 'register', title: 'Registration Form', icon: User, desc: 'Public sign-up & credentials' },
    { id: 'profile', title: 'Profile Biodata Form', icon: Layout, desc: '85+ field matrimonial biodata' },
    { id: 'cv', title: 'Matrimonial CV Form', icon: FileText, desc: 'Sunnah matrimonial resume document' },
    { id: 'payment', title: 'Payment Gateway Fields', icon: CreditCard, desc: 'Billing details, payer info & custom checkout fields' },
  ];

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
            Mouse-driven Drag & Drop reordering powered by <code style={{ color: '#059669' }}>@hello-pangea/dnd</code>. Customize fields, themes, and layouts for Login, Registration, Biodata, CV, and Payment Gateway Checkout.
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

      {/* 2. Compact 5 Form Switcher Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {formTabs.map((item) => {
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
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: isSelected ? 'rgba(5, 150, 105, 0.15)' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--emerald-600)' : '#64748B',
                  }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.title}
                  </h4>
                  {item.id === 'payment' && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: 4 }}>
                      Gateway Desk
                    </span>
                  )}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                {item.desc}
              </p>
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
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '240px' }}
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
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '240px' }}
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

      {/* 4. Main Two-Column Studio Workspace: Left Draggable Editor vs Right Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '22px' }}>
        {/* Left Column: Drag & Drop Reorderable Fields Canvas */}
        <div className="card-3d" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                Form Structure ({fields.length} Fields)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Drag grip handle <GripVertical size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> to reorder fields via mouse
              </p>
            </div>
            <span className="badge-3d" style={{ fontSize: '0.7rem', background: '#ECFDF5', color: '#059669' }}>
              dnd-enabled
            </span>
          </div>

          {/* DND DragDropContext & Droppable Container */}
          {isClientMounted ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-fields-droppable">
                {(droppableProvided, droppableSnapshot) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      maxHeight: '620px',
                      overflowY: 'auto',
                      padding: 4,
                      borderRadius: 10,
                      backgroundColor: droppableSnapshot.isDraggingOver ? 'rgba(5, 150, 105, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {fields.map((field, idx) => (
                      <Draggable key={field.id} draggableId={field.id} index={idx}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              padding: '12px 14px',
                              borderRadius: 10,
                              backgroundColor: dragSnapshot.isDragging ? '#FFFFFF' : 'var(--bg-app)',
                              border: dragSnapshot.isDragging
                                ? '2px solid var(--emerald-600)'
                                : '1px solid var(--border-subtle)',
                              boxShadow: dragSnapshot.isDragging
                                ? '0 12px 24px -4px rgba(5, 150, 105, 0.25)'
                                : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              transition: 'box-shadow 0.15s ease',
                            }}
                          >
                            {/* Grip Handle for Mouse Dragging */}
                            <div
                              {...dragProvided.dragHandleProps}
                              style={{
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: dragSnapshot.isDragging ? 'var(--emerald-600)' : '#94A3B8',
                                padding: '4px 2px',
                                borderRadius: 4,
                              }}
                              title="Click and drag to reorder"
                            >
                              <GripVertical size={18} />
                            </div>

                            {/* Fallback Accessible Move Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <button
                                type="button"
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 1,
                                  cursor: idx === 0 ? 'default' : 'pointer',
                                  opacity: idx === 0 ? 0.3 : 1,
                                  color: 'var(--text-muted)',
                                }}
                                title="Move Up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === fields.length - 1}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 1,
                                  cursor: idx === fields.length - 1 ? 'default' : 'pointer',
                                  opacity: idx === fields.length - 1 ? 0.3 : 1,
                                  color: 'var(--text-muted)',
                                }}
                                title="Move Down"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>

                            {/* Field Details */}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateField(field.id, { width: field.width === 'half' ? 'full' : 'half' })}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: field.width === 'half' ? '#FEF3C7' : '#F1F5F9',
                                  color: field.width === 'half' ? '#B45309' : '#475569',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                                title="Toggle 1-Column vs 2-Column Width"
                              >
                                {field.width === 'half' ? '50%' : '100%'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateField(field.id, { required: !field.required })}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: field.required ? '#ECFDF5' : '#F1F5F9',
                                  color: field.required ? '#047857' : '#64748B',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                {field.required ? 'Req' : 'Opt'}
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
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading form canvas...
            </div>
          )}

          {/* Add Field Palette Contextual to Selected Form */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              {selectedFormId === 'payment'
                ? 'QUICK-ADD PAYMENT & BILLING FIELDS:'
                : 'QUICK-ADD FIELDS FROM PALETTE:'}
            </span>

            {selectedFormId === 'payment' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                <button
                  type="button"
                  onClick={() => handleAddField('profile_token', 'Profile Token ID', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  + Profile Token (Auto)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('payer_name', 'Payer Full Name', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Payer Name
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('payer_phone', 'WhatsApp / Phone', 'tel', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + WhatsApp / Phone
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('billing_address', 'Street Address', 'text', 'full')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Street Address
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('city', 'City', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + City
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('state_province', 'State / Province', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + State / Province
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('postal_code', 'Postal Code / ZIP', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Postal Code / ZIP
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('country', 'Country', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Country
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('wali_consent', 'Wali / Guardian Consent', 'checkbox', 'full')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Wali Consent
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('order_notes', 'Special Order Instructions', 'textarea', 'full')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Order Notes
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                <button
                  type="button"
                  onClick={() => handleAddField('phone_number', 'Phone Number', 'tel', 'full')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Phone
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('date_of_birth', 'Date of Birth', 'date', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + DOB
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('guardian_wali', 'Wali / Guardian Name', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Wali Guardian
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('profession', 'Profession & Career', 'text', 'half')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Profession
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('custom_note', 'Matrimonial Notes', 'textarea', 'full')}
                  className="btn-3d-secondary"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                >
                  + Custom Textarea
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive WYSIWYG Form Preview */}
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

            {selectedFormId === 'payment' && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(5, 150, 105, 0.08)',
                  border: '1px dashed #059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.8rem',
                  color: '#065F46',
                }}
              >
                <ShieldCheck size={18} />
                <span>
                  <strong>Halal Guaranteed Checkout:</strong> Authenticated candidate biodata & Profile Token are auto-populated into this payment payload.
                </span>
              </div>
            )}

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
                    ) : f.type === 'checkbox' ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer', marginTop: 4 }}>
                        <input type="checkbox" defaultChecked />
                        <span>{f.placeholder || f.label}</span>
                      </label>
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
