'use client';

import { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Shield, FolderOpen, Eye, Check } from 'lucide-react';
import { FileManagerModal } from './FileManagerModal';

export interface SelectedMedia {
  url: string;
  thumbUrl: string;
  blurUrl: string;
  name: string;
  id?: string;
}

interface MediaUploadPickerProps {
  label?: string;
  description?: string;
  value?: SelectedMedia | null;
  onChange: (media: SelectedMedia | null) => void;
  required?: boolean;
  aspectRatio?: 'portrait' | 'square' | 'wide';
}

export function MediaUploadPicker({
  label = 'Profile Photo',
  description = 'Upload high quality photo. Generated with 3 WebP variants & Purdah modesty protection.',
  value,
  onChange,
  required = false,
  aspectRatio = 'portrait',
}: MediaUploadPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'normal' | 'purdah'>('normal');

  const handleSelect = (media: SelectedMedia) => {
    onChange(media);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const getAspectRatioStyle = () => {
    if (aspectRatio === 'square') return { width: 140, height: 140 };
    if (aspectRatio === 'wide') return { width: 240, height: 140 };
    return { width: 130, height: 165 }; // Portrait avatar
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
          </label>
          {value && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
            >
              <Check size={12} /> Photo Attached
            </span>
          )}
        </div>
      )}

      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          {description}
        </p>
      )}

      {value?.url ? (
        /* Image Preview Card */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: '#F8FAFC',
            border: '1.5px solid var(--border-medium)',
            borderRadius: 14,
            padding: 12,
          }}
        >
          {/* Thumbnail preview */}
          <div
            style={{
              ...getAspectRatioStyle(),
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
              background: '#E2E8F0',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={previewTab === 'purdah' && value.blurUrl ? value.blurUrl : value.thumbUrl || value.url}
              alt={value.name || 'Profile photo'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {previewTab === 'purdah' && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 6,
                }}
              >
                24px Purdah
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <h4
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  maxWidth: 240,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value.name || 'Profile Avatar'}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  WebP Ready
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  3 Variants Auto-Generated
                </span>
              </div>
            </div>

            {/* Toggle Purdah preview */}
            {value.blurUrl && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('normal')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    background: previewTab === 'normal' ? '#ECFDF5' : '#fff',
                    color: previewTab === 'normal' ? '#047857' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('purdah')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    background: previewTab === 'purdah' ? '#FEF2F2' : '#fff',
                    color: previewTab === 'purdah' ? '#DC2626' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Purdah View
                </button>
              </div>
            )}

            {/* Change or Remove Buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                  background: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FolderOpen size={14} /> Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #FECDD3',
                  background: '#FFF1F2',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#BE123C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onClick={() => setModalOpen(true)}
          style={{
            border: '2px dashed var(--border-medium)',
            borderRadius: 14,
            padding: '24px 18px',
            background: '#F8FAFC',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderOpen size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Open File Manager to Select or Upload
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Drag & drop from your computer or choose from library
            </p>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--emerald-800)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <Upload size={14} /> Browse Media Manager
          </div>
        </div>
      )}

      {/* File Manager Modal instance */}
      <FileManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
        title={`Select ${label}`}
      />
    </div>
  );
}
