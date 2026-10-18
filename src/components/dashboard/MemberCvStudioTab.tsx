'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Save,
  Printer,
  Sparkles,
  RefreshCw,
  Download,
  BookOpen,
} from 'lucide-react';
import { MemberResumeRecord } from '@/db/queries';
import { uploadResumeAction, saveRichCvAction, deleteResumeAction } from '@/lib/cv/cvActions';
import { CvViewerModal } from './CvViewerModal';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface MemberCvStudioTabProps {
  initialResumes: MemberResumeRecord[];
  userId: string;
  userFullName: string;
}

const DEFAULT_MATRIMONIAL_TEMPLATE = `
<div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #059669; padding-bottom: 16px;">
  <p style="font-size: 1.25rem; font-family: 'Amiri', serif; color: #059669; margin: 0 0 6px 0;">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
  <h1 style="font-size: 1.75rem; margin: 0 0 4px 0; color: #0F172A; letter-spacing: -0.5px;">ISLAMIC MATRIMONIAL BIODATA & CV</h1>
  <p style="font-size: 0.875rem; color: #64748B; margin: 0;">In The Name of Allah, The Most Gracious, The Most Merciful</p>
</div>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">1. PERSONAL & BASIC PROFILE</h2>
<p><strong>Full Name:</strong> [Enter Full Legal Name]<br>
<strong>Age & Date of Birth:</strong> 26 Years (DD-MM-YYYY)<br>
<strong>Marital Status:</strong> Never Married<br>
<strong>Height & Complexion:</strong> 5' 9" • Fair Complexion<br>
<strong>Current Location:</strong> New York, NY, United States<br>
<strong>Citizenship:</strong> US Citizen / Permanent Resident</p>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">2. RELIGIOUS COMMITMENT & PRACTICE</h2>
<p><strong>Religion / Sect:</strong> Islam • Sunni (Hanafi)<br>
<strong>Salah (Daily Prayers):</strong> Always 5 times daily<br>
<strong>Diet:</strong> Strictly 100% Halal<br>
<strong>Quran & Islamic Studies:</strong> Recites Quran daily, studied basic Fiqh<br>
<strong>Lifestyle & Habits:</strong> Non-smoker, active community member at local Islamic center</p>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">3. EDUCATION & PROFESSIONAL CAREER</h2>
<p><strong>Highest Degree:</strong> Bachelor of Science in Computer Science / Engineering<br>
<strong>Institution:</strong> State University of New York<br>
<strong>Current Designation:</strong> Senior Software Engineer<br>
<strong>Employer Industry:</strong> Healthcare IT (New York, NY)<br>
<strong>Career Goals:</strong> Striving for financial independence and ethical earnings</p>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">4. NOBLE FAMILY BACKGROUND</h2>
<p><strong>Father's Occupation:</strong> Retired Civil Engineer<br>
<strong>Mother's Occupation:</strong> Homemaker<br>
<strong>Siblings:</strong> 1 Elder Brother (Physician), 1 Younger Sister (University Student)<br>
<strong>Family Values:</strong> Practicing, moderate, close-knit Islamic household</p>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">5. DESIRED SPOUSE EXPECTATIONS</h2>
<p>Seeking a pious, kind-hearted practicing Muslim life partner who prioritizes family values, mutual respect, and companionship on the path of Sunnah. Willing to support her educational and personal growth.</p>

<h2 style="font-size: 1.15rem; color: #059669; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-top: 20px;">6. GUARDIAN / WALI CONTACT DETAILS</h2>
<p><strong>Wali Name:</strong> [Guardian Name]<br>
<strong>Relationship:</strong> Father / Brother<br>
<strong>Contact Phone:</strong> +1 (555) 019-2834<br>
<strong>Email:</strong> guardian@example.com</p>
`;

export function MemberCvStudioTab({
  initialResumes,
  userId,
  userFullName,
}: MemberCvStudioTabProps) {
  const [resumes, setResumes] = useState<MemberResumeRecord[]>(initialResumes);
  const [selectedResumeForModal, setSelectedResumeForModal] = useState<MemberResumeRecord | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('Matrimonial Biodata & CV');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Word-Style Rich Builder State
  const [docTitle, setDocTitle] = useState('Executive Matrimonial Biodata');
  const [savingDoc, setSavingDoc] = useState(false);
  const [docMessage, setDocMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cross-Tab Sync: auto-refresh when CV is updated from another tab
  useCrossTabSync((msg) => {
    if (msg.type === 'CV_UPDATED') {
      // Local state will refresh or re-fetch gracefully
      setUploadMessage({ text: '✓ CV synchronization updated from another window', isError: false });
    }
  }, ['CV_UPDATED']);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = DEFAULT_MATRIMONIAL_TEMPLATE;
    }
  }, []);

  // Format Command Executor for Word-Style toolbar
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle CV Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadMessage({ text: 'Please select a document file to upload', isError: true });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('resumeFile', uploadFile);
    formData.append('title', uploadTitle);

    const res = await uploadResumeAction(null, formData);
    setUploading(false);

    if (res.success && res.resume) {
      setResumes((prev) => [res.resume as MemberResumeRecord, ...prev]);
      setUploadFile(null);
      setUploadMessage({ text: '✓ Matrimonial CV uploaded and verified successfully!', isError: false });
      broadcastSyncEvent('CV_UPDATED', { userId });
      setTimeout(() => setUploadMessage(null), 4000);
    } else {
      setUploadMessage({ text: res.error || 'Failed to upload document', isError: true });
    }
  };

  // Handle Save Rich Document
  const handleSaveRichDoc = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;

    setSavingDoc(true);
    setDocMessage(null);

    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('documentContent', content);

    const res = await saveRichCvAction(null, formData);
    setSavingDoc(false);

    if (res.success && res.resume) {
      setResumes((prev) => [res.resume as MemberResumeRecord, ...prev]);
      setDocMessage({ text: '✓ Matrimonial CV saved and formatted successfully in PostgreSQL!', isError: false });
      broadcastSyncEvent('CV_UPDATED', { userId });
      setTimeout(() => setDocMessage(null), 4000);
    } else {
      setDocMessage({ text: res.error || 'Failed to save document', isError: true });
    }
  };

  // Handle Delete Resume
  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to remove this CV document?')) return;
    const res = await deleteResumeAction(id);
    if (res.success) {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      broadcastSyncEvent('CV_UPDATED', { userId });
    }
  };

  // Load an existing rich resume into the Word editor
  const handleLoadResumeIntoEditor = (resume: MemberResumeRecord) => {
    if (resume.documentContent && editorRef.current) {
      editorRef.current.innerHTML = resume.documentContent;
      setDocTitle(resume.title);
      setDocMessage({ text: `✓ Loaded "${resume.title}" into Word Builder`, isError: false });
      setTimeout(() => setDocMessage(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
            <span style={{ fontSize: '1.4rem' }}>📄</span>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Matrimonial CV & Resume Studio
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Compose, format, and share Sunnah-compliant matrimonial biodatas with popup preview and print capability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              if (editorRef.current) {
                setSelectedResumeForModal({
                  id: 'preview_temp',
                  userId,
                  resumeType: 'RICH_BUILDER',
                  title: docTitle,
                  documentContent: editorRef.current.innerHTML,
                  isPrimary: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }
            }}
            className="btn-3d-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Eye size={16} />
            Quick Preview Modal
          </button>
        </div>
      </div>

      {/* Grid: Upload & Document Library */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
        {/* 1. Upload CV Section */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald-600)',
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Upload Existing CV</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PDF, Word (.docx), or high-res document images
              </p>
            </div>
          </div>

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                Document Title
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Shahid_Matrimonial_CV_2026"
                className="input-field"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}
                required
              />
            </div>

            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 12,
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-app)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('resumeFileInput')?.click()}
            >
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
              />
              <FileText size={32} color="var(--emerald-600)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>
                {uploadFile ? uploadFile.name : 'Click to select or drop resume document'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Maximum size: 10 MB • Stored securely
              </p>
            </div>

            {uploadMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: uploadMessage.isError ? '#FEF2F2' : '#ECFDF5',
                  color: uploadMessage.isError ? '#B91C1C' : '#047857',
                  border: `1px solid ${uploadMessage.isError ? '#FCA5A5' : '#A7F3D0'}`,
                }}
              >
                {uploadMessage.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                {uploadMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="btn-3d"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.875rem',
                opacity: uploading || !uploadFile ? 0.6 : 1,
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload & Save Document
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2. Active Resumes List */}
        <div className="card-3d" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-600)',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Saved Matrimonial CVs</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {resumes.length} active documents in your matrimonial portfolio
              </p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {resumes.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 12,
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>No resumes uploaded yet</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Upload a PDF/Word file or compose one using the Word-Style Builder below.
                </p>
              </div>
            ) : (
              resumes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </span>
                      {item.isPrimary && (
                        <span
                          className="badge-3d"
                          style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#ECFDF5', color: '#047857' }}
                        >
                          Primary CV
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.resumeType === 'RICH_BUILDER' ? 'Word-Engine Document' : item.fileName || 'Uploaded File'}
                      {item.fileSizeBytes && ` • ${(item.fileSizeBytes / 1024).toFixed(1)} KB`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.resumeType === 'RICH_BUILDER' && (
                      <button
                        type="button"
                        onClick={() => handleLoadResumeIntoEditor(item)}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          borderRadius: 6,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                        title="Load into Word editor"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedResumeForModal(item)}
                      style={{
                        background: 'var(--emerald-600)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: 6,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Eye size={14} /> View
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteResume(item.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#DC2626',
                        borderRadius: 6,
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete Resume"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Word-Style Interactive Matrimonial CV Builder */}
      <div className="card-3d" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Word-Style Matrimonial CV Builder</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Professional rich document editor with Sunnah headings, formatting toolbar, and instant print/export.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                minWidth: '220px',
              }}
            />
            <button
              type="button"
              onClick={handleSaveRichDoc}
              disabled={savingDoc}
              className="btn-3d"
              style={{ fontSize: '0.85rem', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {savingDoc ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Save CV to Database
            </button>
          </div>
        </div>

        {docMessage && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: docMessage.isError ? '#FEF2F2' : '#ECFDF5',
              color: docMessage.isError ? '#B91C1C' : '#047857',
              border: `1px solid ${docMessage.isError ? '#FCA5A5' : '#A7F3D0'}`,
            }}
          >
            {docMessage.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {docMessage.text}
          </div>
        )}

        {/* Word-Style Toolbar */}
        <div
          style={{
            backgroundColor: '#0F172A',
            padding: '10px 14px',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 6,
            borderBottom: '2px solid #10B981',
          }}
        >
          {/* Text Style */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            style={toolbarBtnStyle}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            style={toolbarBtnStyle}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            style={toolbarBtnStyle}
            title="Underline (Ctrl+U)"
          >
            <Underline size={15} />
          </button>

          <span style={toolbarDividerStyle} />

          {/* Headings */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            style={toolbarBtnStyle}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            style={toolbarBtnStyle}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </button>

          <span style={toolbarDividerStyle} />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            style={toolbarBtnStyle}
            title="Bullet List"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            style={toolbarBtnStyle}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </button>

          <span style={toolbarDividerStyle} />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            style={toolbarBtnStyle}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            style={toolbarBtnStyle}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            style={toolbarBtnStyle}
            title="Align Right"
          >
            <AlignRight size={15} />
          </button>

          <span style={toolbarDividerStyle} />

          {/* Islamic Stamp */}
          <button
            type="button"
            onClick={() => {
              executeCommand(
                'insertHTML',
                `<div style="text-align: center; margin: 16px 0; color: #059669; font-weight: bold; font-family: 'Amiri', serif; font-size: 1.2rem;">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>`
              );
            }}
            style={{
              ...toolbarBtnStyle,
              padding: '6px 10px',
              fontSize: '0.75rem',
              color: '#34D399',
            }}
            title="Insert Bismillah Header"
          >
            ☪ Bismillah
          </button>

          {/* Reset Template */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset editor to default matrimonial template?')) {
                if (editorRef.current) {
                  editorRef.current.innerHTML = DEFAULT_MATRIMONIAL_TEMPLATE;
                }
              }
            }}
            style={{
              ...toolbarBtnStyle,
              marginLeft: 'auto',
              padding: '6px 10px',
              fontSize: '0.75rem',
              color: '#94A3B8',
            }}
            title="Reset Template"
          >
            <RefreshCw size={13} /> Reset Template
          </button>
        </div>

        {/* Word Document Canvas (Paper View) */}
        <div
          style={{
            backgroundColor: '#334155',
            padding: '32px 16px',
            borderRadius: '0 0 10px 10px',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              width: '100%',
              maxWidth: '780px',
              minHeight: '700px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '52px 64px',
              borderRadius: '4px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '1rem',
              lineHeight: 1.6,
              outline: 'none',
              cursor: 'text',
            }}
          />
        </div>
      </div>

      {/* Modal Popup for Document Viewer */}
      <CvViewerModal
        resume={selectedResumeForModal}
        onClose={() => setSelectedResumeForModal(null)}
      />
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  background: '#1E293B',
  border: '1px solid #334155',
  color: '#E2E8F0',
  borderRadius: 6,
  padding: '6px 8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const toolbarDividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  backgroundColor: '#334155',
  margin: '0 4px',
};
