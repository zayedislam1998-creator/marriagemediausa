'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  X,
  Upload,
  Image as ImageIcon,
  Search,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Eye,
  Shield,
  Grid,
  List,
  AlertCircle,
} from 'lucide-react';
import { MediaItem } from '@/lib/storage/mediaService';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: {
    url: string;
    thumbUrl: string;
    blurUrl: string;
    name: string;
    id: string;
  }) => void;
  title?: string;
  category?: 'avatar' | 'gallery' | 'document' | 'general';
}

export function FileManagerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Enterprise Media Manager',
  category = 'avatar',
}: FileManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewVariant, setPreviewVariant] = useState<'full' | 'thumb' | 'blur'>('full');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload state
  const [uploadQueue, setUploadQueue] = useState<
    { file: File; progress: number; status: 'pending' | 'uploading' | 'done' | 'error'; error?: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch media files from /api/media
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
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  // Handle Drag & Drop Upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const newQueue = acceptedFiles.map((f) => ({
        file: f,
        progress: 0,
        status: 'pending' as const,
      }));
      setUploadQueue(newQueue);
      setIsUploading(true);

      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('category', category);

      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();

        if (result.success && result.items && result.items.length > 0) {
          setUploadQueue((prev) =>
            prev.map((item) => ({ ...item, progress: 100, status: 'done' }))
          );
          // Refetch and switch to library tab with newly uploaded file selected
          await fetchMedia();
          setSelectedItem(result.items[0]);
          setActiveTab('library');
        } else {
          setUploadQueue((prev) =>
            prev.map((item) => ({
              ...item,
              status: 'error',
              error: result.error || 'Upload failed',
            }))
          );
        }
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((item) => ({
            ...item,
            status: 'error',
            error: err.message || 'Network error during upload',
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [category, fetchMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  // Handle Delete
  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.originalName || item.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(item.id || item.name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMediaList((prev) => prev.filter((m) => m.id !== item.id && m.name !== item.name));
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
        }
      } else {
        alert(data.error || 'Failed to delete file');
      }
    } catch {
      alert('Network error deleting media file');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url: string) => {
    const full = window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filter media items
  const filteredList = mediaList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.originalName && item.originalName.toLowerCase().includes(q))
    );
  });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="card-3d"
        style={{
          width: '100%',
          maxWidth: 1040,
          height: '90vh',
          maxHeight: 760,
          background: '#FFFFFF',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              }}
            >
              <FolderOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {title}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                WebP Optimization • 24px Purdah Modesty Shield • Disk Storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: activeTab === 'library' ? '#ECFDF5' : 'transparent',
                color: activeTab === 'library' ? '#047857' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <ImageIcon size={16} />
              Media Library ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: activeTab === 'upload' ? '#ECFDF5' : 'transparent',
                color: activeTab === 'upload' ? '#047857' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <Upload size={16} />
              Upload Files
            </button>
          </div>

          {activeTab === 'library' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 32px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    outline: 'none',
                    width: 180,
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

              {/* View Switch */}
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
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
                  title="Grid View"
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
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={fetchMedia}
                disabled={loading}
                style={{
                  padding: '6px 10px',
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
                title="Refresh Library"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Main Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {activeTab === 'upload' ? (
            /* Upload Tab Content */
            <div
              style={{
                flex: 1,
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflowY: 'auto',
              }}
            >
              <div
                {...getRootProps()}
                style={{
                  width: '100%',
                  maxWidth: 620,
                  border: `2px dashed ${isDragActive ? '#059669' : '#CBD5E1'}`,
                  borderRadius: 18,
                  padding: '48px 32px',
                  textAlign: 'center',
                  background: isDragActive ? '#F0FDF4' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <input {...getInputProps()} />
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: isDragActive ? '#DCFCE7' : '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDragActive ? '#059669' : '#475569',
                  }}
                >
                  <Upload size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {isDragActive ? 'Drop your photos here...' : 'Drag & drop photos or click to browse'}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
                    Supports JPG, PNG, WebP up to 15MB per file
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    color: '#065F46',
                    fontWeight: 600,
                  }}
                >
                  <Shield size={14} />
                  <span>Sharp WebP compression & 24px Purdah blur generated automatically</span>
                </div>
              </div>

              {/* Upload Progress Queue */}
              {uploadQueue.length > 0 && (
                <div style={{ width: '100%', maxWidth: 620, marginTop: 24 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                    Upload Queue
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {uploadQueue.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                          <ImageIcon size={18} style={{ color: '#059669', flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 320,
                            }}
                          >
                            {item.file.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.status === 'uploading' && (
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                              Processing WebP...
                            </span>
                          )}
                          {item.status === 'done' && (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.75rem',
                                color: '#059669',
                                fontWeight: 700,
                              }}
                            >
                              <Check size={14} /> Ready
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.75rem',
                                color: '#DC2626',
                                fontWeight: 700,
                              }}
                            >
                              <AlertCircle size={14} /> Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Media Library Tab Content */
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Media Grid or List Area */}
              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  borderRight: '1px solid var(--border-subtle)',
                }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '0.875rem' }}>Loading media files...</p>
                  </div>
                ) : filteredList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <ImageIcon size={48} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      No media files found
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {searchQuery ? 'Try a different search query' : 'Upload photos to get started'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="btn-3d"
                      style={{
                        marginTop: 16,
                        padding: '8px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      <Upload size={16} style={{ marginRight: 6 }} /> Upload Photos
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid View */
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: 14,
                    }}
                  >
                    {filteredList.map((item) => {
                      const isSelected = selectedItem?.id === item.id || selectedItem?.name === item.name;
                      return (
                        <div
                          key={item.id || item.name}
                          onClick={() => setSelectedItem(item)}
                          style={{
                            position: 'relative',
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: isSelected
                              ? '2.5px solid #059669'
                              : '1.5px solid var(--border-subtle)',
                            cursor: 'pointer',
                            aspectRatio: '3/4',
                            background: '#F8FAFC',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected
                              ? '0 0 0 3px rgba(5, 150, 105, 0.2)'
                              : 'none',
                          }}
                        >
                          <img
                            src={item.thumbUrl || item.url}
                            alt={item.originalName || item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            loading="lazy"
                          />

                          {/* Selected Checkmark Badge */}
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
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              }}
                            >
                              <Check size={14} />
                            </div>
                          )}

                          {/* Bottom info pill */}
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
                  /* List / Table View */
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Preview</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>File Name</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Size</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Dimensions</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((item) => {
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
                            <td style={{ padding: '8px 10px' }}>
                              <img
                                src={item.thumbUrl || item.url}
                                alt={item.name}
                                style={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 6 }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-main)' }}>
                              {item.originalName || item.name}
                            </td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
                              {item.formattedSize}
                            </td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
                              {item.width && item.height ? `${item.width} × ${item.height}` : '—'}
                            </td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Selected Media Inspector Sidebar (Desktop) */}
              {selectedItem && (
                <div
                  style={{
                    width: 320,
                    background: '#F8FAFC',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    overflowY: 'auto',
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    File Details
                  </h4>

                  {/* 3-Variant Image Preview */}
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: '#fff',
                      border: '1px solid var(--border-subtle)',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                      }}
                    />

                    {/* Variant toggle pills */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 10,
                        padding: 3,
                        gap: 3,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewVariant('full')}
                        style={{
                          border: 'none',
                          borderRadius: 7,
                          padding: '4px 6px',
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
                          borderRadius: 7,
                          padding: '4px 6px',
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
                          borderRadius: 7,
                          padding: '4px 6px',
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

                  {/* Metadata List */}
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      fontSize: '0.785rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>File Name:</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={selectedItem.originalName || selectedItem.name}
                      >
                        {selectedItem.originalName || selectedItem.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Format:</span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        WebP Optimized
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>File Size:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {selectedItem.formattedSize}
                      </span>
                    </div>

                    {selectedItem.width && selectedItem.height && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Dimensions:</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {selectedItem.width} × {selectedItem.height} px
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Uploaded:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedItem.url)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#fff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
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
                        borderRadius: 10,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#BE123C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      title="Delete permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedItem ? (
              <span>
                Selected: <strong>{selectedItem.originalName || selectedItem.name}</strong> (
                {selectedItem.formattedSize})
              </span>
            ) : (
              <span>No image selected</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onSelect({
                    url: selectedItem.url,
                    thumbUrl: selectedItem.thumbUrl,
                    blurUrl: selectedItem.blurUrl,
                    name: selectedItem.name,
                    id: selectedItem.id,
                  });
                  onClose();
                }
              }}
              className="btn-3d"
              style={{
                padding: '10px 22px',
                fontSize: '0.85rem',
                fontWeight: 800,
                opacity: selectedItem ? 1 : 0.5,
                cursor: selectedItem ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Check size={16} /> Insert Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
