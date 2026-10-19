'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FolderOpen,
  Upload,
  Image as ImageIcon,
  Search,
  Check,
  Trash2,
  Copy,
  RefreshCw,
  Eye,
  Shield,
  Grid,
  List,
  HardDrive,
  FileCheck,
  Filter,
} from 'lucide-react';
import { MediaItem } from '@/lib/storage/mediaService';

export function MediaManagerTab() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewVariant, setPreviewVariant] = useState<'full' | 'thumb' | 'blur'>('full');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setMediaList(data.items);
        if (data.items.length > 0 && !selectedItem) {
          setSelectedItem(data.items[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load media in Admin:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);

      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append('files', file));
      formData.append('category', 'avatar');

      try {
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
          await fetchMedia();
          if (result.items?.[0]) setSelectedItem(result.items[0]);
          setShowUploadZone(false);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (err: any) {
        alert(err.message || 'Error uploading files');
      } finally {
        setIsUploading(false);
      }
    },
    [fetchMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 15 * 1024 * 1024,
  });

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.originalName || item.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(item.id || item.name)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMediaList((prev) => prev.filter((m) => m.id !== item.id && m.name !== item.name));
        if (selectedItem?.id === item.id) setSelectedItem(null);
      } else {
        alert(data.error || 'Failed to delete file');
      }
    } catch {
      alert('Error deleting file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const full = window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filtered = mediaList.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.originalName && m.originalName.toLowerCase().includes(q));
  });

  const totalBytes = mediaList.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);
  const formattedTotalSize = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Stats Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card-3d" style={{ padding: '18px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Files</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{mediaList.length}</div>
            </div>
          </div>
        </div>

        <div className="card-3d" style={{ padding: '18px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Disk Usage</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{formattedTotalSize}</div>
            </div>
          </div>
        </div>

        <div className="card-3d" style={{ padding: '18px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Purdah Modesty</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>100% 24px Blur</div>
            </div>
          </div>
        </div>

        <div className="card-3d" style={{ padding: '18px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FDF4FF',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>WebP Engine</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Sharp 3-Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-3d" style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
        {/* Controls Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowUploadZone(!showUploadZone)}
              className="btn-3d"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Upload size={16} />
              {showUploadZone ? 'Close Upload' : 'Upload New Media'}
            </button>
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              style={{
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 12px 7px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.825rem',
                  outline: 'none',
                  width: 200,
                }}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>

            <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'grid' ? '#F1F5F9' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? '#0F172A' : '#94A3B8',
                }}
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'list' ? '#F1F5F9' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'list' ? '#0F172A' : '#94A3B8',
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Zone (Expandable) */}
        {showUploadZone && (
          <div style={{ padding: '20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#059669' : '#CBD5E1'}`,
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
                background: isDragActive ? '#F0FDF4' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input {...getInputProps()} />
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={24} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {isDragActive ? 'Drop images to upload...' : 'Drag & drop photos or click to select files'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                All photos are processed with Sharp: 800x1000 Full, 300x375 Thumb, and 24px Purdah Gaussian Blur.
              </p>
              {isUploading && (
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                  Processing uploads...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content Area (Grid + Inspector) */}
        <div style={{ display: 'flex', minHeight: 460 }}>
          {/* Main Gallery Area */}
          <div style={{ flex: 1, padding: '20px', borderRight: '1px solid var(--border-subtle)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem' }}>Loading media files from disk...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <ImageIcon size={44} style={{ color: '#CBD5E1', margin: '0 auto 10px' }} />
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>No media files found</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Upload photos using the button above.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
                {filtered.map((item) => {
                  const isSelected = selectedItem?.id === item.id || selectedItem?.name === item.name;
                  return (
                    <div
                      key={item.id || item.name}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: isSelected ? '2.5px solid #059669' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        aspectRatio: '3/4',
                        background: '#F8FAFC',
                        boxShadow: isSelected ? '0 0 0 3px rgba(5, 150, 105, 0.2)' : 'none',
                      }}
                    >
                      <img
                        src={item.thumbUrl || item.url}
                        alt={item.originalName || item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#059669',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={14} />
                        </div>
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                          padding: '16px 6px 6px',
                          color: '#fff',
                          fontSize: '0.65rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.originalName || item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Preview</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Size</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Dimensions</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const isSelected = selectedItem?.id === item.id || selectedItem?.name === item.name;
                    return (
                      <tr
                        key={item.id || item.name}
                        onClick={() => setSelectedItem(item)}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isSelected ? '#ECFDF5' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '8px' }}>
                          <img
                            src={item.thumbUrl || item.url}
                            alt={item.name}
                            style={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 6 }}
                          />
                        </td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{item.originalName || item.name}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{item.formattedSize}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                          {item.width && item.height ? `${item.width} × ${item.height}` : '—'}
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Inspector Drawer */}
          {selectedItem && (
            <div
              style={{
                width: 300,
                background: '#F8FAFC',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                File Details
              </h4>

              <div
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                <img
                  src={
                    previewVariant === 'full'
                      ? selectedItem.url
                      : previewVariant === 'thumb'
                      ? selectedItem.thumbUrl
                      : selectedItem.blurUrl
                  }
                  alt={selectedItem.name}
                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    right: 6,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    background: 'rgba(15, 23, 42, 0.85)',
                    borderRadius: 8,
                    padding: 2,
                    gap: 2,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewVariant('full')}
                    style={{
                      border: 'none',
                      borderRadius: 6,
                      padding: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: previewVariant === 'full' ? '#059669' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVariant('thumb')}
                    style={{
                      border: 'none',
                      borderRadius: 6,
                      padding: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: previewVariant === 'thumb' ? '#059669' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    Thumb
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVariant('blur')}
                    style={{
                      border: 'none',
                      borderRadius: 6,
                      padding: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: previewVariant === 'blur' ? '#059669' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    Purdah
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: '0.785rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                  <span style={{ fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedItem.originalName || selectedItem.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                  <span style={{ fontWeight: 600 }}>{selectedItem.formattedSize}</span>
                </div>
                {selectedItem.width && selectedItem.height && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dimensions:</span>
                    <span style={{ fontWeight: 600 }}>{selectedItem.width} × {selectedItem.height}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                  <span style={{ fontWeight: 600 }}>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedItem.url)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#fff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {copiedUrl ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                  {copiedUrl ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedItem)}
                  disabled={isDeleting}
                  style={{
                    padding: '8px 12px',
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    borderRadius: 8,
                    color: '#BE123C',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
