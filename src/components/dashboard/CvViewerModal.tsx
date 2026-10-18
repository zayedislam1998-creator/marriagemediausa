'use client';

import { useState } from 'react';
import { X, Printer, Download, FileText, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { MemberResumeRecord } from '@/db/queries';

interface CvViewerModalProps {
  resume: MemberResumeRecord | null;
  onClose: () => void;
}

export function CvViewerModal({ resume, onClose }: CvViewerModalProps) {
  const [zoom, setZoom] = useState<number>(100);

  if (!resume) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUploadedPdf = resume.fileUrl?.endsWith('.pdf');
  const isImage = resume.fileUrl?.match(/\.(jpeg|jpg|png|webp)$/i);

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
          maxWidth: '900px',
          maxHeight: '92vh',
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
            padding: '16px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                {resume.title || 'Matrimonial CV & Biodata'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                {resume.resumeType === 'RICH_BUILDER'
                  ? 'Interactive Word-Formatted Document'
                  : `Uploaded File (${resume.fileName || 'Document'})`}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {resume.resumeType === 'RICH_BUILDER' && (
              <>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(70, prev - 15))}
                  title="Zoom Out"
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#E2E8F0',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                  }}
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: 42, textAlign: 'center' }}>
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(140, prev + 15))}
                  title="Zoom In"
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#E2E8F0',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                  }}
                >
                  <ZoomIn size={14} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#E2E8F0',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Printer size={14} />
              Print
            </button>

            {resume.fileUrl && (
              <a
                href={resume.fileUrl}
                download={resume.fileName || 'matrimonial_cv'}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--emerald-600, #059669)',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  padding: '6px 12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <Download size={14} />
                Download
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
              }}
              title="Close Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Document Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {resume.resumeType === 'RICH_BUILDER' && resume.documentContent ? (
            <div
              style={{
                width: '100%',
                maxWidth: '750px',
                backgroundColor: '#FFFFFF',
                padding: '48px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                minHeight: '800px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
                color: '#1E293B',
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: resume.documentContent }}
            />
          ) : isUploadedPdf ? (
            <iframe
              src={resume.fileUrl!}
              title="Resume Document Viewer"
              style={{
                width: '100%',
                height: '75vh',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
            />
          ) : isImage ? (
            <div style={{ textAlign: 'center', maxWidth: '100%' }}>
              <img
                src={resume.fileUrl!}
                alt={resume.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '500px',
                margin: 'auto',
              }}
            >
              <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>Document Ready for Download</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#64748B' }}>
                {resume.fileName} is stored securely in the PostgreSQL vault.
              </p>
              {resume.fileUrl && (
                <a href={resume.fileUrl} download className="btn-3d" style={{ display: 'inline-flex' }}>
                  <Download size={16} /> Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
