'use client';

import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Save,
} from 'lucide-react';

export interface ContactSubmissionRecord {
  id: string;
  type: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject?: string | null;
  cityState?: string | null;
  serviceType?: string | null;
  message: string;
  status: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function InquiriesInboxTab() {
  const [inquiries, setInquiries] = useState<ContactSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries(data.inquiries || []);
      } else {
        setErrorMsg(data.error || 'Failed to fetch inquiries.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED') => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch {}
    setUpdatingId(null);
  };

  const handleSaveNotes = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: inquiries.find((i) => i.id === id)?.status || 'IN_REVIEW', adminNotes: noteDraft }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, adminNotes: noteDraft } : item))
        );
        setActiveNoteEditId(null);
      }
    } catch {}
    setUpdatingId(null);
  };

  const filteredInquiries = inquiries.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phoneNumber.toLowerCase().includes(q) ||
      (item.cityState && item.cityState.toLowerCase().includes(q)) ||
      (item.serviceType && item.serviceType.toLowerCase().includes(q)) ||
      item.message.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchType = typeFilter === 'ALL' || item.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const weddingCount = inquiries.filter((i) => i.type === 'WEDDING_SERVICE').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <div
        className="card-3d"
        style={{
          padding: '20px 24px',
          background: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Inbound Inquiries & Concierge Desk
            </h3>
            <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
              {inquiries.length} Inquiries Recorded
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Durable PostgreSQL inbox for public contact messages, verification requests, and Halal wedding vendor inquiries.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="btn-3d-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh Inbox
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="card-3d" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            New Unassigned
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669', marginTop: 4 }}>
            {newCount}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '16px 20px', borderLeft: '4px solid #D97706' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Wedding Vendor Requests
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#D97706', marginTop: 4 }}>
            {weddingCount}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '16px 20px', borderLeft: '4px solid #0284C7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            In Review / Contacted
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284C7', marginTop: 4 }}>
            {inquiries.filter((i) => i.status === 'IN_REVIEW' || i.status === 'CONTACTED').length}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '16px 20px', borderLeft: '4px solid #64748B' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Resolved
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#475569', marginTop: 4 }}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-3d"
        style={{
          padding: '16px 20px',
          background: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone, city, or inquiry text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-3d"
            style={{ width: '100%', paddingLeft: 38, fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-3d"
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="CONTACTED">Contacted</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-3d"
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="WEDDING_SERVICE">Wedding Services</option>
            <option value="CONTACT">Contact Form</option>
            <option value="GENERAL">General Support</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          Loading inquiries from database...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="card-3d" style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF' }}>
          <Inbox size={42} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: '0 0 6px', fontWeight: 800, color: '#1E293B' }}>No Inquiries Match Your Criteria</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
            {inquiries.length === 0 ? 'No public inquiries have been recorded yet.' : 'Try adjusting your search query or status filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredInquiries.map((item) => (
            <div
              key={item.id}
              className="card-3d"
              style={{
                padding: '20px',
                background: '#FFFFFF',
                borderLeft:
                  item.status === 'NEW'
                    ? '5px solid #059669'
                    : item.status === 'CONTACTED'
                    ? '5px solid #0284C7'
                    : item.status === 'RESOLVED'
                    ? '5px solid #94A3B8'
                    : '5px solid #D97706',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                      {item.fullName}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background:
                          item.type === 'WEDDING_SERVICE'
                            ? 'rgba(217, 119, 6, 0.12)'
                            : 'rgba(5, 150, 105, 0.12)',
                        color: item.type === 'WEDDING_SERVICE' ? '#B45309' : '#059669',
                      }}
                    >
                      {item.type === 'WEDDING_SERVICE' ? '🕌 Wedding Service' : '✉️ Contact Form'}
                    </span>
                    {item.serviceType && (
                      <span className="badge-3d" style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155' }}>
                        {item.serviceType}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Clock size={12} /> {new Date(item.createdAt).toLocaleString()} &bull; ID: <code>{item.id.slice(0, 8)}</code>
                  </span>
                </div>

                {/* Status Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Status:</span>
                  <select
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                    className="input-3d"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color:
                        item.status === 'NEW'
                          ? '#059669'
                          : item.status === 'CONTACTED'
                          ? '#0284C7'
                          : item.status === 'RESOLVED'
                          ? '#64748B'
                          : '#D97706',
                    }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              {/* Contact Information Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  fontSize: '0.82rem',
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="#059669" />
                  <a href={`mailto:${item.email}`} style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                    {item.email}
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} color="#0284C7" />
                  <a href={`tel:${item.phoneNumber}`} style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none' }}>
                    {item.phoneNumber}
                  </a>
                </div>

                {item.cityState && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <MapPin size={14} color="#D97706" />
                    <span>{item.cityState}</span>
                  </div>
                )}
              </div>

              {/* Inquiry Message Text */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {item.message}
                </p>
              </div>

              {/* Admin Notes Section */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                {activeNoteEditId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Internal Admin Notes:</label>
                    <textarea
                      rows={2}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add notes about calls, quotes sent, or follow-ups..."
                      className="input-3d"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setActiveNoteEditId(null)}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid #CBD5E1', background: '#FFF' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => handleSaveNotes(item.id)}
                        className="btn-3d-emerald"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Save size={13} /> Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      <strong>Admin Notes:</strong>{' '}
                      {item.adminNotes ? (
                        <span style={{ color: '#1E293B' }}>{item.adminNotes}</span>
                      ) : (
                        <span style={{ fontStyle: 'italic' }}>None recorded yet</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNoteEditId(item.id);
                        setNoteDraft(item.adminNotes || '');
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {item.adminNotes ? 'Edit Notes' : '+ Add Note'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
